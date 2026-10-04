import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { scrapeAllPlatforms } from "./src/serverJobScraper";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(cors());
  app.use(express.json({ limit: "5mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "PostuTrack JobSpy API" });
  });

  // Real Multi-Platform Scraper endpoint (LinkedIn, Indeed, Welcome to the Jungle, Glassdoor, JobTeaser, HelloWork, Dice, France Travail)
  app.post("/api/scrape-jobs", async (req, res) => {
    try {
      const {
        query,
        search_term,
        keywords,
        search_terms,
        location = "Paris, France",
        results_wanted = 100,
        sites = ["linkedin", "indeed", "wttj", "glassdoor", "jobteaser", "hellowork", "dice", "francetravail"],
        contract_type = null,
        job_type = null,
        is_remote = false,
        hours_old = 168
      } = req.body || {};

      const rawKeywords = keywords || search_terms || (query ? [query] : null) || (search_term ? [search_term] : ["Software Engineer"]);
      const keywordsList = Array.isArray(rawKeywords) ? rawKeywords : [String(rawKeywords)];
      const requestedSites = Array.isArray(sites) && sites.length > 0 ? sites : ["linkedin", "indeed", "wttj", "glassdoor", "jobteaser", "hellowork", "dice", "francetravail"];

      const jobs = await scrapeAllPlatforms({
        keywords: keywordsList,
        search_term: search_term || keywordsList[0],
        location,
        results_wanted: Number(results_wanted) || 100,
        sites: requestedSites,
        contract_type: contract_type || job_type || null,
        is_remote: Boolean(is_remote),
        hours_old: Number(hours_old) || 168
      });

      return res.json({
        success: true,
        jobs,
        count: jobs.length,
        total_candidates: jobs.length,
        sources_used: requestedSites,
        searched_keywords: keywordsList
      });
    } catch (err: any) {
      console.error("Scraper API error:", err);
      return res.status(500).json({
        success: false,
        error: `Erreur lors de l'exécution du scraper: ${err?.message || err}`,
        jobs: []
      });
    }
  });

  // Dedicated server-side job page extraction proxy
  app.post("/api/extract-job-url", async (req, res) => {
    const { url } = req.body || {};
    if (!url || typeof url !== "string") {
      return res.status(400).json({ success: false, error: "Missing job URL parameter" });
    }

    const cleanUrl = url.trim();
    const targetUrl = /^https?:\/\//i.test(cleanUrl) ? cleanUrl : `https://${cleanUrl}`;
    let text = "";

    // 1. Try Jina Reader without encoding the scheme slashes
    try {
      const jinaUrl = `https://r.jina.ai/${targetUrl}`;
      const jinaRes = await fetch(jinaUrl, {
        headers: {
          "Accept": "text/plain",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
        },
        signal: AbortSignal.timeout(12000)
      });
      if (jinaRes.ok) {
        const jinaText = await jinaRes.text();
        if (jinaText && jinaText.length > 60) {
          text = jinaText;
        }
      }
    } catch (_jinaErr) {
      // Jina reader fallback
    }

    // 2. Direct HTML fetch fallback if Jina failed or returned minimal data
    if (!text || text.length < 100) {
      try {
        const directRes = await fetch(targetUrl, {
          headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7"
          },
          signal: AbortSignal.timeout(10000)
        });
        if (directRes.ok) {
          const rawHtml = await directRes.text();
          
          // Check for JSON-LD JobPosting schema
          const jsonLdMatch = rawHtml.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
          if (jsonLdMatch) {
            for (const tag of jsonLdMatch) {
              try {
                const content = tag.replace(/<\/?script[^>]*>/gi, '').trim();
                const parsed = JSON.parse(content);
                const items = Array.isArray(parsed) ? parsed : (parsed['@graph'] || [parsed]);
                const job = items.find((it: any) => it['@type'] === 'JobPosting');
                if (job) {
                  const jobTitle = job.title || '';
                  const company = job.hiringOrganization?.name || '';
                  const desc = (job.description || '')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                  if (desc.length > 50) {
                    text = `# ${jobTitle}\n**Entreprise:** ${company}\n\n${desc}`;
                    break;
                  }
                }
              } catch (e) {
                // Ignore parse errors from non-job JSON-LD
              }
            }
          }

          // If no JSON-LD found, clean standard HTML body
          if (!text || text.length < 100) {
            const stripped = rawHtml
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
              .replace(/<!--[\s\S]*?-->/g, '')
              .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
              .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
              .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
              .replace(/<\/?[a-z][a-z0-9]*[^<>]*>/gi, ' ')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/\s{2,}/g, ' ')
              .trim();
            if (stripped.length > 100) {
              text = stripped;
            }
          }
        }
      } catch (_directErr) {
        // Direct fetch fallback if target URL domain is unresolvable or blocking
      }
    }

    if (!text || text.trim().length === 0) {
      return res.json({
        success: false,
        error: "Site protégé ou inaccessible pour l'extraction automatique.",
        rawText: "",
        url: targetUrl
      });
    }

    return res.json({
      success: true,
      rawText: text,
      url: targetUrl
    });
  });

  // Smart model matcher to resolve tags and typos (e.g. 'llama3.2:b' or 'llama3.2' -> 'llama3.2:3b')
  const resolveOllamaModel = (requested: string, availableModels: string[]): string | null => {
    if (!availableModels || availableModels.length === 0) return null;
    const cleanReq = requested.trim().toLowerCase();

    // 1. Exact match (case insensitive)
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

    return null;
  };

  // Universal helper to read both streaming NDJSON and buffered JSON from Ollama
  const readOllamaStream = async (response: Response): Promise<{ content: string; raw: any }> => {
    let rawText = "";
    if (response.body?.getReader) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        rawText += decoder.decode(value, { stream: true });
      }
    } else {
      rawText = await response.text();
    }

    rawText = (rawText || "").trim();
    if (!rawText) {
      return { content: "", raw: null };
    }

    // 1. Try parsing rawText as a single complete JSON object first!
    try {
      const singleJson = JSON.parse(rawText);
      if (singleJson.message?.content) {
        return { content: singleJson.message.content, raw: singleJson };
      }
      if (singleJson.response) {
        return { content: singleJson.response, raw: singleJson };
      }
      if (singleJson.error) {
        throw new Error(singleJson.error);
      }
    } catch (e: any) {
      if (e.message && !e.message.includes("JSON")) throw e;
    }

    // 2. Parse as NDJSON (streaming chunks delimited by newline)
    const lines = rawText.split("\n");
    let fullContent = "";
    let lastJson: any = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const chunk = JSON.parse(trimmed);
        lastJson = chunk;
        if (chunk.message?.content) {
          fullContent += chunk.message.content;
        } else if (chunk.response) {
          fullContent += chunk.response;
        } else if (chunk.error) {
          throw new Error(chunk.error);
        }
      } catch (e: any) {
        if (e.message && !e.message.includes("JSON")) throw e;
      }
    }

    return {
      content: fullContent || rawText,
      raw: lastJson || { message: { content: fullContent } }
    };
  };

  // Dedicated server-side proxy for Ollama local & remote instances
  const handleOllamaTags = async (req: express.Request, res: express.Response) => {
    try {
      const rawEndpoint = (req.body?.endpoint || req.query?.endpoint || "http://127.0.0.1:11434").toString().trim();
      const endpoint = /^https?:\/\//i.test(rawEndpoint) ? rawEndpoint.replace(/\/+$/, '') : `http://${rawEndpoint}`.replace(/\/+$/, '');
      const rawAuth = (req.body?.apiKey || req.query?.apiKey || req.headers?.authorization || "").toString().trim();

      const headers: Record<string, string> = {
        "Accept": "application/json",
        "User-Agent": "curl/8.5.0",
        "ngrok-skip-browser-warning": "true",
        "bypass-tunnel-reminder": "true",
        "Bypass-Tunnel-Reminder": "true",
        "Origin": "http://localhost:11434"
      };
      if (rawAuth) {
        headers["Authorization"] = rawAuth.startsWith("Bearer ") ? rawAuth : `Bearer ${rawAuth}`;
      }

      const response = await fetch(`${endpoint}/api/tags`, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(8000)
      });

      const text = await response.text().catch(() => "");
      if (!response.ok) {
        if (response.status === 403) {
          return res.status(403).json({
            success: false,
            errorCode: 403,
            error: `Accès refusé (Erreur 403) : Ollama ou le tunnel a bloqué la requête. Relancez Ollama avec OLLAMA_ORIGINS="*" ollama serve ou ajoutez '--http-host-header localhost' à votre tunnel.`
          });
        }
        return res.status(response.status).json({
          success: false,
          error: `Ollama endpoint returned HTTP ${response.status}: ${text || response.statusText}`
        });
      }

      if (!text || text.trim().startsWith("<")) {
        return res.status(502).json({
          success: false,
          error: `L'hôte distant (${endpoint}) a renvoyé une page HTML au lieu de l'API JSON Ollama.`
        });
      }

      const data = JSON.parse(text);
      return res.json({
        success: true,
        models: data.models || [],
        endpoint
      });
    } catch (err: any) {
      return res.status(502).json({
        success: false,
        error: `Impossible de contacter Ollama (${err?.message || "Connexion refusée"}). Assurez-vous qu'Ollama est démarré avec 'ollama serve' ou via un tunnel (cloudflared/ngrok/localtunnel).`
      });
    }
  };

  app.get("/api/ollama/tags", handleOllamaTags);
  app.post("/api/ollama/tags", handleOllamaTags);
  app.get("/api/tags", handleOllamaTags);

  app.post("/api/ollama/chat", async (req, res) => {
    try {
      const rawEndpoint = (req.body?.endpoint || "http://127.0.0.1:11434").toString().trim();
      const endpoint = /^https?:\/\//i.test(rawEndpoint) ? rawEndpoint.replace(/\/+$/, '') : `http://${rawEndpoint}`.replace(/\/+$/, '');
      const rawAuth = (req.body?.apiKey || req.headers?.authorization || "").toString().trim();
      let { model = "llama3.2", messages = [], format, options, system } = req.body || {};

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "curl/8.5.0",
        "ngrok-skip-browser-warning": "true",
        "bypass-tunnel-reminder": "true",
        "Bypass-Tunnel-Reminder": "true",
        "Origin": "http://localhost:11434"
      };
      if (rawAuth) {
        headers["Authorization"] = rawAuth.startsWith("Bearer ") ? rawAuth : `Bearer ${rawAuth}`;
      }

      // Query installed models on target to auto-resolve requested model tag (e.g. 'llama3.2:b' -> 'llama3.2:3b')
      let availableModels: string[] = [];
      try {
        const tagsRes = await fetch(`${endpoint}/api/tags`, {
          method: "GET",
          headers,
          signal: AbortSignal.timeout(5000)
        });
        if (tagsRes.ok) {
          const tagsData: any = await tagsRes.json().catch(() => ({}));
          if (Array.isArray(tagsData.models)) {
            availableModels = tagsData.models.map((m: any) => typeof m === "string" ? m : (m.name || m.model));
          }
        }
      } catch (e) {
        // non-blocking
      }

      if (availableModels.length > 0) {
        const resolved = resolveOllamaModel(model, availableModels);
        if (resolved) {
          model = resolved;
        }
      }

      const formattedMessages = Array.isArray(messages) ? [...messages] : [];
      if (system && !formattedMessages.some((m: any) => m.role === "system")) {
        formattedMessages.unshift({ role: "system", content: system });
      }

      // STREAMING: stream: true keeps Cloudflare Tunnel from timing out with Error 524
      const payload: any = {
        model,
        messages: formattedMessages,
        stream: true,
        options: {
          temperature: 0.1,
          num_ctx: 4096,
          num_predict: 1500,
          ...(options || {})
        }
      };
      if (format) payload.format = format;

      const response = await fetch(`${endpoint}/api/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(240000) // 4 minutes
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        
        // Error 524: Cloudflare Timeout
        if (response.status === 524 || text.includes("524")) {
          return res.status(524).json({
            success: false,
            errorCode: 524,
            error: `Délai d'attente Cloudflare (Erreur 524) : Votre modèle met trop de temps à répondre sur votre machine. Essayez un modèle plus rapide et compact comme 'llama3.2:3b' ou 'qwen2.5:3b'.`
          });
        }

        // Error 404: Model not found
        if (response.status === 404 || text.includes("not found")) {
          const listStr = availableModels.length > 0 ? ` Modèles installés détectés sur votre Ollama : ${availableModels.join(', ')}.` : "";
          return res.status(404).json({
            success: false,
            errorCode: 404,
            error: `Modèle '${model}' non trouvé dans votre Ollama.${listStr} Installez-le avec 'ollama run ${model}' ou choisissez un modèle installé dans les Paramètres.`
          });
        }

        // Error 403: Forbidden
        if (response.status === 403) {
          return res.status(403).json({
            success: false,
            errorCode: 403,
            error: `Accès refusé (Erreur 403) : Ollama ou le tunnel a bloqué la requête. Relancez Ollama avec OLLAMA_ORIGINS="*" ollama serve ou ajoutez '--http-host-header localhost' à votre tunnel.`
          });
        }

        return res.status(response.status).json({
          success: false,
          error: `Ollama API Error (${response.status}): ${text || response.statusText}`
        });
      }

      // Read NDJSON stream into full response
      const { content, raw } = await readOllamaStream(response);
      return res.json({
        model,
        message: { role: "assistant", content },
        response: content,
        done: true,
        raw
      });
    } catch (err: any) {
      if (err?.name === "TimeoutError" || err?.message?.includes("timeout")) {
        return res.status(504).json({
          success: false,
          error: `Délai d'attente dépassé (Timeout). Le modèle local a mis plus de 4 minutes à répondre. Privilégiez un modèle compact comme 'llama3.2:3b'.`
        });
      }
      return res.status(502).json({
        success: false,
        error: `Impossible de contacter Ollama sur '${req.body?.endpoint || "http://127.0.0.1:11434"}' (${err?.message || "Connexion refusée"}). Vérifiez qu'Ollama est démarré ou que votre tunnel est actif.`
      });
    }
  });

  app.post("/api/ollama/generate", async (req, res) => {
    try {
      const rawEndpoint = (req.body?.endpoint || "http://127.0.0.1:11434").toString().trim();
      const endpoint = /^https?:\/\//i.test(rawEndpoint) ? rawEndpoint.replace(/\/+$/, '') : `http://${rawEndpoint}`.replace(/\/+$/, '');
      const rawAuth = (req.body?.apiKey || req.headers?.authorization || "").toString().trim();
      let { model = "llama3.2", prompt = "", system = "", format, options } = req.body || {};

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "curl/8.5.0",
        "ngrok-skip-browser-warning": "true",
        "bypass-tunnel-reminder": "true",
        "Bypass-Tunnel-Reminder": "true",
        "Origin": "http://localhost:11434"
      };
      if (rawAuth) {
        headers["Authorization"] = rawAuth.startsWith("Bearer ") ? rawAuth : `Bearer ${rawAuth}`;
      }

      // Query installed models on target to auto-resolve requested model tag
      try {
        const tagsRes = await fetch(`${endpoint}/api/tags`, {
          method: "GET",
          headers,
          signal: AbortSignal.timeout(5000)
        });
        if (tagsRes.ok) {
          const tagsData: any = await tagsRes.json().catch(() => ({}));
          if (Array.isArray(tagsData.models)) {
            const availableModels = tagsData.models.map((m: any) => typeof m === "string" ? m : (m.name || m.model));
            const resolved = resolveOllamaModel(model, availableModels);
            if (resolved) model = resolved;
          }
        }
      } catch (e) {
        // non-blocking
      }

      const payload: any = {
        model,
        prompt,
        stream: true,
        options: {
          temperature: 0.1,
          num_predict: 2048,
          ...(options || {})
        }
      };
      if (system) payload.system = system;
      if (format) payload.format = format;

      const response = await fetch(`${endpoint}/api/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(240000)
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        if (response.status === 524 || text.includes("524")) {
          return res.status(524).json({
            success: false,
            errorCode: 524,
            error: `Délai d'attente Cloudflare (Erreur 524) : Votre modèle local a mis trop de temps à répondre.`
          });
        }
        return res.status(response.status).json({
          success: false,
          error: `Ollama API Error (${response.status}): ${text || response.statusText}`
        });
      }

      const { content, raw } = await readOllamaStream(response);
      return res.json({
        model,
        response: content,
        done: true,
        raw
      });
    } catch (err: any) {
      return res.status(502).json({
        success: false,
        error: `Impossible de contacter Ollama sur '${req.body?.endpoint || "http://127.0.0.1:11434"}' (${err?.message || "Connexion refusée"}).`
      });
    }
  });

  // Server-side Gemini generation requiring explicit user API key (no shared server key)
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const apiKey = (req.body?.apiKey || "").toString().trim();
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: "Clé API Gemini personnelle requise. Renseignez votre propre clé dans les Paramètres ou utilisez Ollama (100% gratuit et illimité)."
        });
      }

      const { prompt = "", responseSchema } = req.body || {};
      const candidateModels = ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      let lastErrText = "";

      for (const m of candidateModels) {
        try {
          const bodyPayload: any = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json"
            }
          };
          if (responseSchema) {
            bodyPayload.generationConfig.responseSchema = responseSchema;
          }

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyPayload),
            signal: AbortSignal.timeout(60000)
          });

          if (response.ok) {
            const data: any = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              return res.json({
                success: true,
                model: m,
                text
              });
            }
          } else {
            lastErrText = await response.text().catch(() => "");
          }
        } catch (e: any) {
          lastErrText = e?.message || "";
        }
      }

      return res.status(502).json({
        success: false,
        error: `Erreur API Gemini: ${lastErrText || "Aucun modèle n'a pu répondre."}`
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err?.message || "Erreur interne Gemini"
      });
    }
  });

  // Groq API Proxy - Model Listing & Verification
  app.post("/api/groq/models", async (req, res) => {
    try {
      const apiKey = (req.body?.apiKey || "").toString().trim();
      if (!apiKey) {
        return res.status(400).json({ success: false, error: "Clé API Groq manquante." });
      }

      const response = await fetch("https://api.groq.com/openai/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        signal: AbortSignal.timeout(15000)
      });

      const data: any = await response.json().catch(() => ({}));
      if (response.ok && Array.isArray(data?.data)) {
        const activeModels = data.data
          .filter((m: any) => m.active !== false && !m.id?.includes("whisper") && !m.id?.includes("guard") && !m.id?.includes("tts"))
          .map((m: any) => m.id);
        return res.json({ success: true, models: activeModels });
      }

      return res.status(response.status).json({
        success: false,
        error: data?.error?.message || `Erreur Groq API (${response.status})`
      });
    } catch (err: any) {
      return res.status(502).json({
        success: false,
        error: err?.message || "Impossible de contacter Groq"
      });
    }
  });

  // Groq API Proxy - Chat Completion (LPU™ High-Speed Cloud)
  app.post("/api/groq/chat", async (req, res) => {
    try {
      const apiKey = (req.body?.apiKey || "").toString().trim();
      if (!apiKey) {
        return res.status(400).json({ success: false, error: "Clé API Groq manquante." });
      }

      const { model = "llama-3.3-70b-versatile", messages = [], response_format, temperature = 0.1 } = req.body || {};

      const payload: any = {
        model,
        messages,
        temperature
      };
      if (response_format) {
        payload.response_format = response_format;
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(60000)
      });

      const data: any = await response.json().catch(() => ({}));
      if (response.ok && data?.choices?.[0]?.message?.content) {
        return res.json({
          success: true,
          content: data.choices[0].message.content,
          model: data.model || model,
          usage: data.usage
        });
      }

      return res.status(response.status).json({
        success: false,
        error: data?.error?.message || `Erreur Groq API (${response.status})`
      });
    } catch (err: any) {
      return res.status(502).json({
        success: false,
        error: err?.message || "Impossible de joindre l'API Groq"
      });
    }
  });

  // Ensure unhandled API routes return a clean JSON 404 instead of falling through to Vite's index.html
  app.all("/api/*all", (_req, res) => {
    res.status(404).json({ success: false, error: "API route not found" });
  });

  // Vite middleware for development vs production static serving
  const isProduction = process.env.NODE_ENV === "production" || 
    (typeof __filename !== "undefined" && (__filename.endsWith("server.cjs") || __filename.includes("dist")));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
