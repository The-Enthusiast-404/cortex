// src/lib/api.ts
import { StreamingResponse, Model } from "../store/types";

const OLLAMA_API = "http://localhost:11434/api";

export class OllamaAPI {
  async generateStream(
    prompt: string,
    model: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${OLLAMA_API}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to create stream reader");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line) continue;
          const json = JSON.parse(line) as StreamingResponse;
          onChunk(json.response);
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
      throw error;
    }
  }

  async listModels(): Promise<{ models: Model[] }> {
    try {
      const response = await fetch(`${OLLAMA_API}/tags`);
      if (!response.ok) throw new Error("Failed to fetch models");
      const data = await response.json();

      // Transform the Ollama API response into our Model type
      const models: Model[] = data.models.map((model: any) => ({
        name: model.name,
        // Consider a model ready if it's downloaded
        status: model.size ? "ready" : "not-downloaded",
        size: model.size
          ? `${(model.size / 1024 / 1024 / 1024).toFixed(1)}GB`
          : undefined,
      }));

      return { models };
    } catch (error) {
      console.error("List models error:", error);
      throw error;
    }
  }
}

export const ollamaAPI = new OllamaAPI();
