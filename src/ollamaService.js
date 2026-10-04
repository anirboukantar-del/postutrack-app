// Ollama AI Service for PostuTrack
// Provides client-side and proxied communication with local, tunneled, or remote Ollama instances

export const DEFAULT_OLLAMA_URL = 'http://localhost:11434';
export const DEFAULT_OLLAMA_MODEL = 'llama3.2:3b';

export const POPULAR_OLLAMA_MODELS = [
  { id: 'llama3.2:3b', label: 'Llama 3.2 (3B - Tag Officiel Recommandé)', desc: 'Très rapide, parfait pour CV et lettres' },
  { id: 'llama3.2', label: 'Llama 3.2 (Alias Standard)', desc: 'Alias sans tag' },
  { id: 'llama3.2:1b', label: 'Llama 3.2 (1B - Ultra Léger)', desc: 'Génération instantanée sur tout ordinateur' },
  { id: 'llama3.1:8b', label: 'Llama 3.1 (8B)', desc: 'Équilibré, haute précision' },
  { id: 'mistral:latest', label: 'Mistral (7B)', desc: 'Excellente maîtrise du français' },
  { id: 'deepseek-r1:latest', label: 'DeepSeek R1', desc: 'Raisonnement logique poussé' },
  { id: 'qwen2.5:3b', label: 'Qwen 2.5 (3B)', desc: 'Structure JSON irréprochable' },
  { id: 'phi4:latest', label: 'Phi-4 (14B)', desc: 'Modèle compact haute performance de Microsoft' },
  { id: 'gemma2:9b', label: 'Gemma 2 (9B)', desc: 'Modèle Google performant' }
];

export function cleanOllamaUrl(rawUrl) {
  let url = (rawUrl || DEFAULT_OLLAMA_URL).trim();
  if (!url) url = DEFAULT_OLLAMA_URL;
  // If user pasted without protocol, prepend http://
  if (!/^https?:\/\//i.test(url)) {
    url = `http://${url}`;
  }
  // Remove trailing slashes
  return url.replace(/\/+$/, '');
}

export function isHttpsOrigin() {
  return typeof window !== 'undefined' && window.location.protocol === 'https:';
}

export function isLocalhostUrl(url) {
  if (!url) return false;
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(url);
}

/**
 * Smart model resolution to handle typos (e.g. 'llama3.2:b' -> 'llama3.2:3b') or missing tags ('llama3.2' -> 'llama3.2:3b')
 */
export function resolveOllamaModel(requested, availableModels) {
  if (!requested) return DEFAULT_OLLAMA_MODEL;
  if (!availableModels || availableModels.length === 0) return requested.trim();
  
  const cleanReq = requested.trim().toLowerCase();

  // 1. Exact match
  const exact = availableModels.find(m => m.toLowerCase() === cleanReq);
  if (exact) return exact;

  // 2. Base name match (e.g. 'llama3.2' matches 'llama3.2:3b' or 'llama3.2:latest')
  const baseReq = cleanReq.split(':')[0];
  const tagReq = cleanReq.includes(':') ? cleanReq.split(':')[1] : '';

  if (tagReq) {
    const typoMatch = availableModels.find(m => {
      const [mBase, mTag = ''] = m.toLowerCase().split(':');
      return mBase === baseReq && (mTag.includes(tagReq) || tagReq.includes(mTag) || mTag.endsWith('b'));
    });
    if (typoMatch) return typoMatch;
  }

  const baseMatch = availableModels.find(m => m.toLowerCase().startsWith(`${baseReq}:`));
  if (baseMatch) return baseMatch;

  const subMatch = availableModels.find(m => m.toLowerCase().includes(baseReq));
  if (subMatch) return subMatch;

  if (availableModels.length === 1) {
    return availableModels[0];
  }

  return requested.trim();
}

/**
 * Safely parse JSON from a fetch Response, preventing SyntaxError when HTML or error page is returned
 */
async function parseResponseSafely(res) {
  if (res.status === 403) {
    return {
      ok: false,
      is403: true,
      error: `Accès refusé (Erreur 403) : Ollama ou le tunnel a rejeté la requête. Démarrez Ollama avec 'OLLAMA_ORIGINS="*" ollama serve' ou ajoutez '--http-host-header localhost' à votre commande de tunnel.`
    };
  }

  if (res.status === 524) {
    return {
      ok: false,
      is524: true,
      error: `Délai d'attente Cloudflare (Erreur 524) : Le tunnel a expiré après 120s d'attente. Votre modèle local génère trop lentement ou a été lancé sans streaming. Privilégiez un modèle compact comme 'llama3.2:3b'.`
    };
  }

  const rawText = await res.text().catch(() => '');
  if (!rawText) {
    return { ok: false, error: `Réponse vide reçue du serveur (HTTP ${res.status}).` };
  }

  const trimmed = rawText.trim();
  if (trimmed.startsWith('<') || trimmed.toLowerCase().startsWith('<!doctype')) {
    const isForbidden = res.status === 403 || trimmed.toLowerCase().includes('forbidden') || trimmed.toLowerCase().includes('access denied');
    return {
      ok: false,
      isHtml: true,
      error: isForbidden
        ? `Accès refusé (Erreur 403) : Ollama a bloqué la requête. Relancez Ollama avec OLLAMA_ORIGINS="*" ollama serve, ou ajoutez '--http-host-header localhost' à votre tunnel.`
        : `L'URL cible a renvoyé une page HTML (code ${res.status}) au lieu d'une réponse API Ollama.`
    };
  }

  try {
    const data = JSON.parse(trimmed);
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: `Réponse non-JSON reçue (HTTP ${res.status}): ${trimmed.substring(0, 100)}`
    };
  }
}

/**
 * Read streaming NDJSON response from Ollama to keep HTTP connection alive and prevent Cloudflare 524 timeouts
 */
async function readOllamaStream(response) {
  let rawText = '';
  if (response.body && typeof response.body.getReader === 'function') {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      rawText += decoder.decode(value, { stream: true });
    }
  } else if (typeof response.text === 'function') {
    rawText = await response.text();
  }

  rawText = (rawText || '').trim();
  if (!rawText) return '';

  // 1. Try parsing rawText as a single complete JSON object first!
  try {
    const singleJson = JSON.parse(rawText);
    if (singleJson.message?.content) {
      return singleJson.message.content;
    }
    if (singleJson.response) {
      return singleJson.response;
    }
    if (singleJson.error) {
      throw new Error(singleJson.error);
    }
  } catch (singleErr) {
    if (singleErr.message && !singleErr.message.includes('JSON')) {
      throw singleErr;
    }
  }

  // 2. Parse as NDJSON (streaming chunks delimited by newline)
  const lines = rawText.split('\n');
  let fullContent = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const chunk = JSON.parse(trimmed);
      if (chunk.message?.content) {
        fullContent += chunk.message.content;
      } else if (chunk.response) {
        fullContent += chunk.response;
      } else if (chunk.error) {
        throw new Error(chunk.error);
      }
    } catch (lineErr) {
      if (lineErr.message && !lineErr.message.includes('JSON')) {
        throw lineErr;
      }
    }
  }

  return fullContent || rawText;
}

/**
 * Fetch available installed models from Ollama (/api/tags).
 * Attempts direct browser connection first, then falls back to server proxy if CORS/Mixed-Content blocks it.
 */
export async function getOllamaModels(baseUrl = DEFAULT_OLLAMA_URL, apiKey = '') {
  const targetUrl = cleanOllamaUrl(baseUrl);
  let lastError = null;

  const directHeaders = {
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'bypass-tunnel-reminder': 'true',
    'Bypass-Tunnel-Reminder': 'true'
  };
  if (apiKey && apiKey.trim()) {
    directHeaders['Authorization'] = apiKey.trim().startsWith('Bearer ') ? apiKey.trim() : `Bearer ${apiKey.trim()}`;
  }

  // 1. Try direct fetch
  try {
    const directRes = await fetch(`${targetUrl}/api/tags`, {
      method: 'GET',
      headers: directHeaders,
      signal: AbortSignal.timeout(4000)
    });
    
    const parsedDirect = await parseResponseSafely(directRes);
    if (directRes.ok && parsedDirect.ok) {
      const models = Array.isArray(parsedDirect.data?.models) ? parsedDirect.data.models : [];
      return {
        success: true,
        source: 'direct',
        models: models.map(m => typeof m === 'string' ? m : (m.name || m.model))
      };
    } else if (parsedDirect.error) {
      lastError = new Error(parsedDirect.error);
    }
  } catch (err) {
    lastError = err;
  }

  // 2. Fallback to server proxy
  try {
    const proxyRes = await fetch('/api/ollama/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        endpoint: targetUrl,
        apiKey: apiKey?.trim() || undefined
      }),
      signal: AbortSignal.timeout(8000)
    });

    const parsedProxy = await parseResponseSafely(proxyRes);
    if (parsedProxy.ok) {
      const data = parsedProxy.data;
      if (data && data.success && Array.isArray(data.models)) {
        return {
          success: true,
          source: 'proxy',
          models: data.models.map(m => typeof m === 'string' ? m : (m.name || m.model))
        };
      }
      if (data && data.error) {
        throw new Error(data.error);
      }
    } else {
      throw new Error(parsedProxy.error || `Erreur Proxy HTTP ${proxyRes.status}`);
    }
  } catch (proxyErr) {
    lastError = proxyErr;
  }

  const isLocal = isLocalhostUrl(targetUrl);
  const onHttps = isHttpsOrigin();
  let helpfulGuidance = '';

  if (isLocal && onHttps) {
    helpfulGuidance = " Vous êtes sur l'application Web en ligne (HTTPS) : votre navigateur et le serveur Cloud ne peuvent pas contacter directement 'localhost' sans tunnel sécurisé. Lancez simplement 'cloudflared tunnel --url http://localhost:11434 --http-host-header localhost' dans votre terminal et collez l'URL HTTPS générée.";
  }

  throw new Error(
    (lastError?.message?.replace(/fetch failed/i, "Connexion impossible") || 
    `Impossible de contacter Ollama sur ${targetUrl}.`) + helpfulGuidance
  );
}

/**
 * Clean and parse JSON text returned by Ollama
 */
export function extractJsonFromText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Réponse vide reçue du modèle Ollama.');
  }

  let text = rawText.trim();

  // If HTML document was returned
  if (text.startsWith('<') || text.toLowerCase().startsWith('<!doctype')) {
    throw new Error("Une page HTML a été retournée au lieu d'une réponse JSON Ollama.");
  }

  // Strip markdown code fences if present
  if (text.startsWith('```json')) {
    text = text.substring(7);
  } else if (text.startsWith('```')) {
    text = text.substring(3);
  }
  if (text.endsWith('```')) {
    text = text.substring(0, text.length - 3);
  }
  text = text.trim();

  // Direct parse attempt
  try {
    return JSON.parse(text);
  } catch (e1) {
    // Look for outermost JSON object { ... }
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        console.error('Failed to parse matched JSON substring from Ollama:', match[0]);
      }
    }
    console.error('Raw Ollama text could not be parsed as JSON:', rawText);
    throw new Error("Le modèle Ollama n'a pas renvoyé un format JSON valide. Essayez avec un modèle plus performant comme llama3.2:3b, qwen2.5:3b ou mistral.");
  }
}

/**
 * Execute chat completion via Ollama
 */
export async function executeOllamaChat({
  baseUrl = DEFAULT_OLLAMA_URL,
  model = DEFAULT_OLLAMA_MODEL,
  messages = [],
  system = '',
  apiKey = '',
  format = 'json',
  temperature = 0.1,
  timeoutMs = 240000 // 4 minutes for local inference
}) {
  const targetUrl = cleanOllamaUrl(baseUrl);
  let activeModel = (model || DEFAULT_OLLAMA_MODEL).trim();

  // Quick auto-fix of common typos like 'llama3.2:b' -> 'llama3.2:3b'
  if (activeModel === 'llama3.2:b' || activeModel === 'llama3.2:b3') {
    activeModel = 'llama3.2:3b';
  }

  const formattedMessages = [...messages];
  if (system && !formattedMessages.some(m => m.role === 'system')) {
    formattedMessages.unshift({ role: 'system', content: system });
  }

  // STREAMING: stream: true keeps Cloudflare Tunnel from timing out with Error 524
  const payload = {
    model: activeModel,
    messages: formattedMessages,
    stream: true,
    format: format === 'json' ? 'json' : undefined,
    options: {
      temperature: typeof temperature === 'number' ? temperature : 0.1,
      num_ctx: 4096,
      num_predict: 1500
    }
  };

  const directHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'bypass-tunnel-reminder': 'true',
    'Bypass-Tunnel-Reminder': 'true'
  };
  if (apiKey && apiKey.trim()) {
    directHeaders['Authorization'] = apiKey.trim().startsWith('Bearer ') ? apiKey.trim() : `Bearer ${apiKey.trim()}`;
  }

  let fullContent = '';
  let lastError = null;

  const isTunnelUrl = /trycloudflare\.com|ngrok|loca\.lt|tunnel/i.test(targetUrl);
  const onHttps = isHttpsOrigin();
  // On HTTPS web app or with Cloudflare tunnel, ALWAYS use the server proxy first:
  // Node.js backend connects directly via HTTP/2 without browser CORS preflight blocks or timeouts
  const preferProxyFirst = onHttps || isTunnelUrl;

  const callServerProxy = async () => {
    const proxyRes = await fetch('/api/ollama/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: targetUrl,
        apiKey: apiKey?.trim() || undefined,
        model: activeModel,
        messages: formattedMessages,
        format: format === 'json' ? 'json' : undefined,
        options: payload.options
      }),
      signal: AbortSignal.timeout(timeoutMs)
    });

    const parsedProxy = await parseResponseSafely(proxyRes);
    if (proxyRes.ok && parsedProxy.ok && !parsedProxy.data?.error) {
      return parsedProxy.data?.message?.content || parsedProxy.data?.response || '';
    }
    const errorMsg = parsedProxy.data?.error || parsedProxy.error || `Erreur Proxy Ollama ${proxyRes.status}`;
    throw new Error(errorMsg);
  };

  const callDirect = async () => {
    const directRes = await fetch(`${targetUrl}/api/chat`, {
      method: 'POST',
      headers: directHeaders,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(Math.min(timeoutMs, 45000))
    });

    if (directRes.ok) {
      return await readOllamaStream(directRes);
    }
    const parsedDirect = await parseResponseSafely(directRes);
    throw new Error(parsedDirect.error || `Erreur HTTP Ollama ${directRes.status}`);
  };

  if (preferProxyFirst) {
    try {
      fullContent = await callServerProxy();
    } catch (proxyErr) {
      lastError = proxyErr;
      // Only fallback to direct browser fetch if server proxy failed and targetUrl is public HTTPS
      if (targetUrl.startsWith('https://')) {
        try {
          fullContent = await callDirect();
        } catch (_directErr) {
          // Keep the more descriptive proxy error
        }
      }
    }
  } else {
    try {
      fullContent = await callDirect();
    } catch (directErr) {
      lastError = directErr;
      try {
        fullContent = await callServerProxy();
      } catch (proxyErr) {
        lastError = proxyErr;
      }
    }
  }

  if (!fullContent) {
    const rawMsg = lastError?.message || 'Connexion à Ollama impossible.';
    let cleanMsg = rawMsg;
    if (rawMsg.includes('signal timed out') || rawMsg.includes('Timeout') || rawMsg.includes('timeout')) {
      cleanMsg = "Délai d'attente dépassé (Timeout) : Votre modèle Ollama met trop de temps à répondre sur votre machine. Assurez-vous que votre tunnel est actif et privilégiez un modèle compact comme 'llama3.2:3b'.";
    } else {
      cleanMsg = cleanMsg.replace(/fetch failed/i, "Connexion impossible");
    }

    const isLocal = isLocalhostUrl(targetUrl);
    let cloudNotice = "";
    if (isLocal && onHttps) {
      cloudNotice = " Note : Sur l'application Web Cloud, connectez votre Ollama local avec 'cloudflared tunnel --url http://localhost:11434 --http-host-header localhost', puis collez l'adresse HTTPS dans les Paramètres.";
    }

    throw new Error(`${cleanMsg} (${targetUrl}).${cloudNotice}`);
  }

  if (!fullContent || !fullContent.trim()) {
    throw new Error(`Aucune réponse générée par le modèle Ollama '${activeModel}'.`);
  }

  return fullContent;
}
