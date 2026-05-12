import type { VercelRequest, VercelResponse } from "@vercel/node";
import GroqModule from "groq-sdk";
const Groq = (GroqModule as any).default || GroqModule;

const getGroqApiKey = () => process.env.GROQ_API_KEY;
const getOpenRouterApiKey = () => process.env.OPENROUTER_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const url = req.url || "";

  // Health check
  if (req.method === "GET" && (url === "/api/health" || url === "/health" || url.startsWith("/api/health?"))) {
    return res.status(200).json({
      status: "ok",
      environment: "vercel",
      hasGroq: !!process.env.GROQ_API_KEY,
      hasOpenRouter: !!process.env.OPENROUTER_API_KEY,
    });
  }

  // Chat endpoint
  if (req.method === "POST" && (url === "/api/chat" || url === "/chat")) {
    const { model, messages, stream = true } = req.body;

    if (!model || typeof model !== "string") {
      return res.status(400).json({ error: "Invalid or missing model parameter." });
    }
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid or missing messages parameter." });
    }

    const isOpenRouterModel = model.includes("/");
    const apiKey = isOpenRouterModel ? getOpenRouterApiKey() : getGroqApiKey();

    if (!apiKey) {
      return res.status(500).json({
        error: `${isOpenRouterModel ? "OPENROUTER_API_KEY" : "GROQ_API_KEY"} is not defined. Please add it to your Vercel environment variables.`,
      });
    }

    try {
      if (isOpenRouterModel) {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://nexus-ai-six.vercel.app",
            "X-Title": "Nexus AI",
          },
          body: JSON.stringify({ model, messages, stream }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error((error as any).error?.message || `OpenRouter Error: ${response.statusText}`);
        }

        if (stream) {
          res.setHeader("Content-Type", "text/event-stream");
          res.setHeader("Cache-Control", "no-cache");

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          if (!reader) throw new Error("No reader on response body");

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
              } catch (_) {
                // ignore partial chunks
              }
            }
          }
          return res.end();
        } else {
          const data = await response.json();
          return res.status(200).json(data);
        }
      } else {
        // Groq
        const groq = new Groq({ apiKey });

        if (stream) {
          res.setHeader("Content-Type", "text/event-stream");
          res.setHeader("Cache-Control", "no-cache");

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
          return res.end();
        } else {
          const chatCompletion = await groq.chat.completions.create({
            messages,
            model,
            stream: false,
          });
          return res.status(200).json(chatCompletion);
        }
      }
    } catch (error: any) {
      console.error(`[Error] Model: ${model}`, error);
      if (!res.headersSent) {
        return res.status(500).json({ error: error.message || "Internal Server Error" });
      } else {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        return res.end();
      }
    }
  }

  return res.status(404).json({ error: "Not found" });
}
