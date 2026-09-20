import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { scrapeAllPlatforms } from "./src/serverJobScraper";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "5mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "PostuTrack JobSpy API" });
  });

  // Real Multi-Platform Scraper endpoint (LinkedIn, Indeed, Welcome to the Jungle, Glassdoor)
  app.post("/api/scrape-jobs", async (req, res) => {
    try {
      const {
        query,
        search_term,
        keywords,
        search_terms,
        location = "Paris, France",
        results_wanted = 100,
        sites = ["linkedin", "indeed", "wttj", "glassdoor"],
        contract_type = null,
        job_type = null,
        is_remote = false,
        hours_old = 168
      } = req.body || {};

      const rawKeywords = keywords || search_terms || (query ? [query] : null) || (search_term ? [search_term] : ["Software Engineer"]);
      const keywordsList = Array.isArray(rawKeywords) ? rawKeywords : [String(rawKeywords)];
      const requestedSites = Array.isArray(sites) && sites.length > 0 ? sites : ["linkedin", "indeed", "wttj", "glassdoor"];

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
    } catch (jinaErr) {
      console.warn("Server Jina Reader fetch notice:", jinaErr);
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
      } catch (directErr) {
        console.warn("Server direct fetch notice:", directErr);
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

  // Vite middleware for development vs production
  if (process.env.NODE_ENV !== "production") {
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
