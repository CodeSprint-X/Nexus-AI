export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullContent: string) => void;
  onError: (error: Error) => void;
}

export class GroqService {
  static async streamChat(
    model: string,
    messages: ChatMessage[],
    callbacks: StreamCallbacks,
    signal?: AbortSignal
  ) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, stream: true }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to start stream: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";

      if (!reader) throw new Error("No reader found on response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          if (trimmedLine.startsWith("data: ")) {
            const dataStr = trimmedLine.slice(6).trim();
            if (dataStr === "[DONE]") {
              callbacks.onComplete(fullContent);
              return;
            }

            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                throw new Error(data.error);
              }
              if (data.content) {
                fullContent += data.content;
                callbacks.onToken(data.content);
              }
            } catch (e: any) {
              console.error("Error parsing stream chunk", e);
              if (e.message) throw e;
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;
      callbacks.onError(error);
    }
  }

  static async fetchConsensus(modelsOutputs: string[]) {
    const prompt = `You are an expert summarizer. Given the following three model outputs, produce:
(1) a concise consensus paragraph
(2) top 3 areas of agreement
(3) top 3 areas of disagreement or uncertainty
(4) suggested next steps.
Keep summary under 150 words. Present bullet lists for agreements and disagreements.

MODELS OUTPUTS:
${modelsOutputs.map((out, i) => `Model ${i + 1}:\n${out}\n`).join("\n")}
`;

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch consensus");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}
