import express from "express";
import path from "path";
import cors from "cors";
import { spawn } from "child_process";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "5mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "PostuTrack JobSpy API" });
  });

  // Real JobSpy scraper endpoint
  app.post("/api/scrape-jobs", (req, res) => {
    const {
      query,
      search_term,
      keywords,
      search_terms,
      location = "Paris, France",
      results_wanted = 15,
      sites = ["linkedin", "indeed", "glassdoor"],
      contract_type = null,
      job_type = null,
      is_remote = false,
      hours_old = null
    } = req.body || {};

    const payload = JSON.stringify({
      keywords: keywords || search_terms || (query ? [query] : null),
      search_term: search_term || query || "Software Engineer",
      location: location || "Paris, France",
      results_wanted: Math.min(Math.max(parseInt(String(results_wanted)) || 10, 1), 50),
      sites: Array.isArray(sites) && sites.length > 0 ? sites : ["linkedin", "indeed"],
      contract_type: contract_type || null,
      job_type: job_type || null,
      is_remote: Boolean(is_remote),
      hours_old: hours_old ? parseInt(String(hours_old)) : null
    });

    const pythonCmd = process.platform === "win32" ? "python" : "python3";
    const pythonProcess = spawn(pythonCmd, ["scraper_backend.py", payload], {
      cwd: process.cwd(),
      env: { ...process.env, PYTHONUNBUFFERED: "1" }
    });

    let stdoutData = "";
    let stderrData = "";

    pythonProcess.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    const timeout = setTimeout(() => {
      pythonProcess.kill("SIGKILL");
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          error: "Le scraper JobSpy a mis trop de temps à répondre (timeout 75s).",
          jobs: []
        });
      }
    }, 75000);

    pythonProcess.on("close", (code) => {
      clearTimeout(timeout);
      if (res.headersSent) return;

      try {
        // Find JSON in stdout in case any extraneous messages appeared
        const firstBrace = stdoutData.indexOf("{");
        const lastBrace = stdoutData.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonStr = stdoutData.substring(firstBrace, lastBrace + 1);
          const parsed = JSON.parse(jsonStr);
          return res.json(parsed);
        }

        if (code !== 0) {
          return res.status(500).json({
            success: false,
            error: `Erreur du scraper (code ${code}): ${stderrData.slice(0, 300) || "Erreur interne"}`,
            jobs: []
          });
        }

        return res.json({
          success: false,
          error: "Format de réponse inattendu du scraper JobSpy.",
          jobs: []
        });
      } catch (err: any) {
        return res.status(500).json({
          success: false,
          error: `Échec d'analyse de la réponse: ${err?.message || err}`,
          raw: stdoutData.slice(0, 400),
          jobs: []
        });
      }
    });

    pythonProcess.on("error", (err) => {
      clearTimeout(timeout);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: `Impossible de lancer le script Python: ${err.message}`,
          jobs: []
        });
      }
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
