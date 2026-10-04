// Groq AI Service for PostuTrack
// Provides client-side and proxied communication with Groq's high-speed LPU™ Cloud API
// Official API reference: https://console.groq.com/docs/api-reference

export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';

export const POPULAR_GROQ_MODELS = [
  { 
    id: 'openai/gpt-oss-120b', 
    label: 'OpenAI GPT-OSS 120B (Recommandé)', 
    desc: 'Modèle flagship open-weight sur Groq LPU™, 131k contexte, parfait pour CV et lettres' 
  },
  { 
    id: 'openai/gpt-oss-20b', 
    label: 'OpenAI GPT-OSS 20B (Ultra-rapide)', 
    desc: 'Latence minimale, haute précision, 131k tokens de contexte' 
  },
  { 
    id: 'llama-3.3-70b-versatile', 
    label: 'Llama 3.3 70B Versatile', 
    desc: 'Modèle Meta Llama 3.3 70B (selon disponibilité de votre compte)' 
  },
  { 
    id: 'llama-3.1-8b-instant', 
    label: 'Llama 3.1 8B Instant', 
    desc: 'Modèle rapide 8B Meta' 
  },
  { 
    id: 'deepseek-r1-distill-llama-70b', 
    label: 'DeepSeek R1 Distill Llama 70B', 
    desc: 'Raisonnement poussé et analyse ATS détaillée' 
  },
  { 
    id: 'llama-3.2-3b-preview', 
    label: 'Llama 3.2 3B Preview', 
    desc: 'Modèle compact très rapide' 
  },
  { 
    id: 'mixtral-8x7b-32768', 
    label: 'Mixtral 8x7B (MoE 32k)', 
    desc: 'Architecture Mixture-of-Experts avec 32k tokens de contexte' 
  },
  { 
    id: 'gemma2-9b-it', 
    label: 'Gemma 2 9B IT', 
    desc: 'Modèle Google performant' 
  }
];

/**
 * Filter out non-chat models (audio transcription, guard, tts)
 */
export function filterChatModels(models = []) {
  if (!Array.isArray(models)) return [];
  return models.filter(id => {
    if (!id || typeof id !== 'string') return false;
    const lower = id.toLowerCase();
    return !lower.includes('whisper') &&
           !lower.includes('guard') &&
           !lower.includes('tts') &&
           !lower.includes('orpheus') &&
           !lower.includes('audio');
  });
}

/**
 * Fetch available models from Groq API to validate key and populate model dropdown
 */
export async function fetchGroqModels(apiKey) {
  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) {
    return { success: false, error: 'Clé API Groq manquante.' };
  }

  // 1. Try server proxy route first (avoids browser CORS & mixed-origin issues)
  try {
    const proxyRes = await fetch('/api/groq/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: cleanKey }),
      signal: AbortSignal.timeout(15000)
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data.success && Array.isArray(data.models)) {
        const chatModels = filterChatModels(data.models);
        return { success: true, models: chatModels.length > 0 ? chatModels : data.models };
      }
      if (data.error) {
        return { success: false, error: data.error };
      }
    }
  } catch (_proxyErr) {
    // Fallback to direct client call if proxy route not responding
  }

  // 2. Direct browser fallback to official Groq API endpoint
  try {
    const directRes = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanKey}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    });

    const data = await directRes.json().catch(() => ({}));
    if (directRes.ok && Array.isArray(data?.data)) {
      const activeIds = data.data
        .filter(m => m.active !== false)
        .map(m => m.id);
      const chatModels = filterChatModels(activeIds);
      return { success: true, models: chatModels.length > 0 ? chatModels : [DEFAULT_GROQ_MODEL] };
    }

    const errorMsg = data?.error?.message || `Erreur HTTP Groq ${directRes.status}`;
    return { success: false, error: errorMsg };
  } catch (err) {
    return { success: false, error: err.message || 'Impossible de contacter Groq.' };
  }
}

/**
 * Low-level single attempt to invoke Groq API (server proxy with direct fallback)
 */
async function sendSingleGroqRequest({
  apiKey,
  model,
  messages,
  system,
  responseFormat,
  temperature,
  timeoutMs
}) {
  const formattedMessages = [...messages];
  const defaultJsonInstruction = "You must output a single valid JSON object strictly complying with the requested schema. Do not output markdown code blocks or surrounding text.";
  const effectiveSystem = system ? `${system}\n${defaultJsonInstruction}` : defaultJsonInstruction;

  if (!formattedMessages.some(m => m.role === 'system')) {
    formattedMessages.unshift({ role: 'system', content: effectiveSystem });
  }

  const payload = {
    model,
    messages: formattedMessages,
    temperature: typeof temperature === 'number' ? temperature : 0.1
  };

  if (responseFormat === 'json_object') {
    payload.response_format = { type: 'json_object' };
  }

  // 1. Try server proxy
  try {
    const proxyRes = await fetch('/api/groq/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        ...payload
      }),
      signal: AbortSignal.timeout(timeoutMs)
    });

    const data = await proxyRes.json().catch(() => ({}));
    if (proxyRes.ok) {
      if (data.success && data.content) return { success: true, content: data.content, model };
      if (data.choices?.[0]?.message?.content) return { success: true, content: data.choices[0].message.content, model };
    }

    const proxyErrMsg = data?.error || `Erreur Proxy Groq (${proxyRes.status})`;
    return { success: false, error: proxyErrMsg, status: proxyRes.status };
  } catch (proxyErr) {
    // 2. Direct client fallback
    try {
      const directRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs)
      });

      const directData = await directRes.json().catch(() => ({}));
      if (directRes.ok && directData?.choices?.[0]?.message?.content) {
        return { success: true, content: directData.choices[0].message.content, model };
      }

      const directErrMsg = directData?.error?.message || `Erreur Groq Direct (${directRes.status})`;
      return { success: false, error: directErrMsg, status: directRes.status };
    } catch (directErr) {
      return { success: false, error: directErr.message || proxyErr.message };
    }
  }
}

/**
 * Execute chat completion via Groq LPU™ API with automatic model auto-detection and fallback
 */
export async function executeGroqChat({
  apiKey,
  model = DEFAULT_GROQ_MODEL,
  messages = [],
  system = '',
  responseFormat = 'json_object',
  temperature = 0.1,
  timeoutMs = 60000,
  onModelSwitched = null
}) {
  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) {
    throw new Error("Clé API Groq manquante. Veuillez saisir votre clé API Groq (gsk_...) dans les Paramètres.");
  }

  let requestedModel = (model || DEFAULT_GROQ_MODEL).trim();

  // First try with the requested model
  const firstAttempt = await sendSingleGroqRequest({
    apiKey: cleanKey,
    model: requestedModel,
    messages,
    system,
    responseFormat,
    temperature,
    timeoutMs
  });

  if (firstAttempt.success) {
    return firstAttempt.content;
  }

  // Check if failure is due to missing model or access permissions
  const errText = (firstAttempt.error || '').toLowerCase();
  const isModelNotFoundError = 
    errText.includes('does not exist') || 
    errText.includes('do not have access') || 
    errText.includes('model_not_found') ||
    firstAttempt.status === 404;

  if (isModelNotFoundError) {
    // Query available models from Groq for this key
    const modelsResult = await fetchGroqModels(cleanKey);
    const availableChatModels = filterChatModels(modelsResult.models || []);

    if (availableChatModels.length > 0) {
      // Find fallback candidates in priority order
      const priorityPreferences = [
        'openai/gpt-oss-120b',
        'openai/gpt-oss-20b',
        'llama-3.1-8b-instant',
        'llama-3.3-70b-versatile',
        'deepseek-r1-distill-llama-70b',
        'llama-3.2-3b-preview',
        'mixtral-8x7b-32768',
        'gemma2-9b-it'
      ];

      // Build ordered candidate list from accessible models
      const candidatesToTry = [];
      for (const pref of priorityPreferences) {
        if (availableChatModels.includes(pref) && pref !== requestedModel) {
          candidatesToTry.push(pref);
        }
      }
      for (const m of availableChatModels) {
        if (!candidatesToTry.includes(m) && m !== requestedModel) {
          candidatesToTry.push(m);
        }
      }

      // Try the top accessible fallback models
      for (const fallbackModel of candidatesToTry.slice(0, 3)) {
        const fallbackAttempt = await sendSingleGroqRequest({
          apiKey: cleanKey,
          model: fallbackModel,
          messages,
          system,
          responseFormat,
          temperature,
          timeoutMs
        });

        if (fallbackAttempt.success) {
          // Persist the working model to localStorage
          try {
            localStorage.setItem('postutrack_groqmodel', fallbackModel);
            window.dispatchEvent(new CustomEvent('postutrack_groqmodel_updated', { detail: { model: fallbackModel } }));
          } catch (e) {}

          if (typeof onModelSwitched === 'function') {
            onModelSwitched(fallbackModel);
          }

          return fallbackAttempt.content;
        }
      }

      throw new Error(`Le modèle '${requestedModel}' n'est pas accessible avec votre clé Groq. Modèles actifs détectés sur votre compte : ${availableChatModels.slice(0, 6).join(', ')}. Veuillez en sélectionner un dans les Paramètres.`);
    }
  }

  throw new Error(firstAttempt.error || "Erreur de génération avec l'API Groq.");
}
