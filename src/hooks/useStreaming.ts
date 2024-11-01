// src/hooks/useStreaming.ts
import { createSignal } from "solid-js";
import { ollamaAPI } from "../lib/api";

export function useStreaming() {
  const [isStreaming, setIsStreaming] = createSignal(false);
  const [streamContent, setStreamContent] = createSignal("");
  const [error, setError] = createSignal<Error | null>(null);

  const startStreaming = async (prompt: string, model: string) => {
    setIsStreaming(true);
    setStreamContent("");
    setError(null);

    try {
      await ollamaAPI.generateStream(prompt, model, (chunk) => {
        setStreamContent((prev) => prev + chunk);
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsStreaming(false);
    }

    return streamContent();
  };

  return {
    isStreaming,
    streamContent,
    error,
    startStreaming,
  };
}
