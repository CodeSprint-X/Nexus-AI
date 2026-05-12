import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";
import dotenv from "dotenv";

// Load local env vars (ignored on Vercel)
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// API config helpers
const getGroqApiKey = () => process.env.GROQ_API_KEY;
const getOpenRouterApiKey = () => process.env.OPENROUTER_API_KEY;

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    environment: process.env.VERCEL ? "vercel" : "local",
    hasGroq: !!getGroqApiKey(),
    hasOpenRouter: !!getOpenRouterApiKey()
  });
});

// Main Chat Handler
app.post("/api/chat", async (req, res) => {
  const { model, messages, stream = true } = req.body;

  if (!model || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid request payload." });
  }

  const isOpenRouterModel = model.includes("/");
  const apiKey = isOpenRouterModel ? getOpenRouterApiKey() : getGroqApiKey();

  if (!apiKey) {
    return res.status(500).json({ 
      error: `API key for ${isOpenRouterModel ? "OpenRouter" : "Groq"} is not configured.` 
    });
  }

  try {
    if (isOpenRouterModel) {
      // Handle OpenRouter (streaming via fetch)
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://nexus-ai.vercel.app",
        },
        body: JSON.stringify({ model, messages, stream }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `OpenRouter Error: ${resp.statusText}`);
      }

      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        const reader = resp.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        if (!reader) throw new Error("Stream reader not available.");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === "[DONE]") {
              res.write("data: [DONE]\n\n");
              continue;
            }
            try {
              const data = JSON.parse(dataStr);
              const content = data.choices[0]?.delta?.content || "";
              if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
            } catch (e) {}
          }
        }
        res.end();
      } else {
        const result = await resp.json();
        res.json(result);
      }
    } else {
      // Handle Groq (using official SDK)
      const groq = new Groq({ apiKey });
      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        const stream = await groq.chat.completions.create({ messages, model, stream: true });
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
        res.write("data: [DONE]\n\n");
        res.end();
      } else {
        const completion = await groq.chat.completions.create({ messages, model, stream: false });
        res.json(completion);
      }
    }
  } catch (err: any) {
    console.error("Chat Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || "Internal Server Error" });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

// Vite/Static asset serving logic
async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  }
}

// Do not block the export on Vercel
if (!process.env.VERCEL) {
  startServer().catch(err => console.error("Startup failed:", err));
}

export default app;

