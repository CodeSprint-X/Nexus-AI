import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Groq SDK instance
const getGroqApiKey = () => {
  const apiKey = process.env.GROQ_API_KEY;
  return apiKey;
};

// OpenRouter configuration
const getOpenRouterApiKey = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  return apiKey;
};

// API Proxy for Streaming
app.post("/api/chat", async (req, res) => {
  const { model, messages, stream = true } = req.body;
  console.log(`[Request] Model: ${model}, Stream: ${stream}`);

  const isOpenRouterModel = model.includes("/");
  const apiKey = isOpenRouterModel ? getOpenRouterApiKey() : getGroqApiKey();

  if (!apiKey) {
    return res.status(500).json({ 
      error: `${isOpenRouterModel ? "OPENROUTER_API_KEY" : "GROQ_API_KEY"} is not defined. Please add it to your environment variables.` 
    });
  }

  try {
    if (isOpenRouterModel) {
      // Handle OpenRouter with fetch for streaming
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://nexus-ai.vercel.app", // Optional
          "X-Title": "Nexus AI", // Optional
        },
        body: JSON.stringify({
          model,
          messages,
          stream,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `OpenRouter Error: ${response.statusText}`);
      }

      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        if (!reader) throw new Error("No reader on response");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === "[DONE]") {
              res.write("data: [DONE]\n\n");
              continue;
            }

            try {
              const data = JSON.parse(dataStr);
              const content = data.choices[0]?.delta?.content || "";
              if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
              }
            } catch (e) {
              // Ignore parse errors for partial chunks
            }
          }
        }
        res.end();
      } else {
        const data = await response.json();
        res.json(data);
      }
    } else {
      // Handle Groq
      const groq = new Groq({ apiKey });
      
      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const chatCompletion = await groq.chat.completions.create({
          messages,
          model,
          stream: true,
        });

        for await (const chunk of chatCompletion) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        }
        res.write("data: [DONE]\n\n");
        res.end();
      } else {
        const chatCompletion = await groq.chat.completions.create({
          messages,
          model,
          stream: false,
        });
        res.json(chatCompletion);
      }
    }
  } catch (error: any) {
    console.error(`[Error] Model: ${model}, Error:`, error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Internal Server Error" });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

async function startServer() {

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    // Only serve static files here if we're NOT on Vercel.
    // On Vercel, static files are handled by the platform's native routing.
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Always start the server unless we are in the Vercel environment where it's handled as a function
if (!process.env.VERCEL) {
  startServer().catch(console.error);
}

export default app;
