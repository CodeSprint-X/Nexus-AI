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
    // Abort previous if any
    Object.values(abortControllers.current).forEach(c => c.abort());

    const userMessage: ChatMessage = { role: "user", content: prompt };

    // Update all states with the new user message and set to streaming
    setStates((prev) => {
      const next = { ...prev };
      INITIAL_MODELS.forEach(modelId => {
        next[modelId] = { 
          ...prev[modelId],
          tokens: "", 
          status: "streaming", 
          history: [...prev[modelId].history, userMessage] 
        };
      });
      return next;
    });

    INITIAL_MODELS.forEach((modelId, index) => {
      const controller = new AbortController();
      abortControllers.current[modelId] = controller;

      // Access history in the stagger (using state from previous turn is okay here because it's a new call)
      // but to be safer, we'll calculate it from what we just set
      
      setTimeout(() => {
        // We need the latest history for this model
        setStates(currentStates => {
          const messages = currentStates[modelId].history;

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
                setStates((prev) => ({
                  ...prev,
                  [modelId]: { 
                    ...prev[modelId], 
                    status: "completed",
                    history: [...prev[modelId].history, { role: "assistant", content: fullContent }]
                  },
                }));
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
          return currentStates;
        });
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
