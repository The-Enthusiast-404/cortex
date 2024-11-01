// src/components/ModelSelector.tsx
import { createSignal, createEffect, onMount, For } from "solid-js";
import { Model } from "../store/types";
import { ollamaAPI } from "../lib/api";

interface ModelSelectorProps {
  currentModel: string;
  onModelSelect: (model: string) => void;
}

export function ModelSelector(props: ModelSelectorProps) {
  const [models, setModels] = createSignal<Model[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const fetchModels = async () => {
    setLoading(true);
    setError(null);
    try {
      const { models: fetchedModels } = await ollamaAPI.listModels();
      setModels(fetchedModels);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch models");
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    fetchModels();
  });

  return (
    <div class="relative">
      <select
        value={props.currentModel}
        onChange={(e) => props.onModelSelect(e.currentTarget.value)}
        disabled={loading()}
        class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <For each={models()}>
          {(model) => (
            <option value={model.name}>
              {model.name} {model.size ? `(${model.size})` : ""}
            </option>
          )}
        </For>
      </select>

      {loading() && (
        <div class="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div class="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}

      {error() && <p class="mt-1 text-sm text-red-500">{error()}</p>}
    </div>
  );
}
