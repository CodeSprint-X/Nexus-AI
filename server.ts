import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Groq SDK instance
  const getGroq = () => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not defined in environment variables.");
    }
    return new Groq({ apiKey });
  };

  // API Proxy for Streaming
  app.post("/api/chat", async (req, res) => {
    const { model, messages, stream = true } = req.body;
    console.log(`[Groq Request] Model: ${model}, Stream: ${stream}`);

    try {
      const groq = getGroq();
      
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
    } catch (error: any) {
      console.error(`[Groq Error] Model: ${model}, Error:`, error);
      // Ensure headers are sent if not already
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
      } else {
        // If streaming already started, we can't change status code
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
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

startServer();
