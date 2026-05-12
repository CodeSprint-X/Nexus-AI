import { useState, useRef, useCallback } from "react";
import { GroqService, ChatMessage } from "../services/groqService";

export type StreamStatus = "idle" | "streaming" | "completed" | "error";

export interface ModelStreamState {
  tokens: string;
  status: StreamStatus;
  error?: string;
  modelId: string;
  history: ChatMessage[];
}

const INITIAL_MODELS = [
  "llama-3.3-70b-versatile",
  "qwen/qwen3-32b",
  "llama-3.1-8b-instant",
];

export function useStreamingChat() {
  const [states, setStates] = useState<Record<string, ModelStreamState>>(
    INITIAL_MODELS.reduce((acc, modelId) => {
      acc[modelId] = { tokens: "", status: "idle", modelId, history: [] };
      return acc;
    }, {} as Record<string, ModelStreamState>)
  );

  const abortControllers = useRef<Record<string, AbortController>>({});

  const startStreaming = useCallback((prompt: string) => {
    Object.values(abortControllers.current).forEach(c => c.abort());

    const userMessage: ChatMessage = { role: "user", content: prompt };

    // We'll capture the current history for each model to ensure they get their own multi-turn context
    let currentModelHistories: Record<string, ChatMessage[]> = {};

    setStates((prev) => {
      const next = { ...prev };
      INITIAL_MODELS.forEach(modelId => {
        const updatedHistory = [...prev[modelId].history, userMessage];
        currentModelHistories[modelId] = updatedHistory;
        next[modelId] = { 
          ...prev[modelId],
          tokens: "", 
          status: "streaming", 
          history: updatedHistory 
        };
      });
      return next;
    });

    INITIAL_MODELS.forEach((modelId, index) => {
      const controller = new AbortController();
      abortControllers.current[modelId] = controller;

      setTimeout(() => {
        const messages = currentModelHistories[modelId];

        GroqService.streamChat(
          modelId,
          messages,
          {
            onToken: (token) => {
              setStates((prev) => ({
                ...prev,
                [modelId]: {
                  ...prev[modelId],
                  tokens: prev[modelId].tokens + token,
                },
              }));
            },
            onComplete: (fullContent) => {
              setStates((prev) => {
                const existingHistory = prev[modelId].history;
                // Avoid double-adding if state updates were batched weirdly
                const alreadyHasAssistant = existingHistory[existingHistory.length - 1]?.role === "assistant" && 
                                            existingHistory[existingHistory.length - 1]?.content === fullContent;
                
                return {
                  ...prev,
                  [modelId]: { 
                    ...prev[modelId], 
                    status: "completed",
                    history: alreadyHasAssistant ? existingHistory : [...existingHistory, { role: "assistant", content: fullContent }]
                  },
                };
              });
            },
            onError: (error) => {
              setStates((prev) => ({
                ...prev,
                [modelId]: { ...prev[modelId], status: "error", error: error.message },
              }));
            },
          },
          controller.signal
        );
      }, index * 150);
    });
  }, []);

  const stopStreaming = useCallback(() => {
    Object.values(abortControllers.current).forEach((c) => c.abort());
    setStates((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        if (next[id].status === "streaming") {
          next[id].status = "idle";
        }
      });
      return next;
    });
  }, []);

  return { states, startStreaming, stopStreaming };
}
