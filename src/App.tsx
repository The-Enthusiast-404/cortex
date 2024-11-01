// src/App.tsx
import { createEffect, For, Show } from "solid-js";
import {
  MessageCircle,
  Menu,
  Settings,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-solid";
import { createChatStore } from "./store/chatStore";
import { ChatWindow } from "./components/chat/ChatWindow";
import { useStreaming } from "./hooks/useStreaming";
import { ModelSelector } from "./components/ModelSelector";
import { invoke } from "@tauri-apps/api/core";

export default function App() {
  const { state, actions } = createChatStore();
  const { startStreaming, streamContent, isStreaming } = useStreaming();

  // Load saved sessions and check Ollama connection on mount
  createEffect(() => {
    actions.loadFromStorage();
    checkOllamaConnection();
  });

  const checkOllamaConnection = async () => {
    try {
      await fetch("http://localhost:11434/api/tags");
      actions.setOllamaStatus("connected");
    } catch (error) {
      actions.setOllamaStatus("disconnected");
    }
  };

  const currentSession = () =>
    state.sessions.find((s) => s.id === state.currentSessionId);

  const handleSendMessage = async (content: string) => {
    if (!state.currentSessionId || state.ollamaStatus !== "connected") return;

    // Add user message
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content,
      timestamp: new Date(),
    };
    actions.addMessage(state.currentSessionId, userMessage);

    try {
      actions.setLoading(true);
      const response = await startStreaming(
        content,
        currentSession()?.model || state.currentModel
      );

      // Add assistant message
      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: response,
        timestamp: new Date(),
      };
      actions.addMessage(state.currentSessionId, assistantMessage);
    } catch (error) {
      actions.setError(error as Error);
    } finally {
      actions.setLoading(false);
    }
  };

  return (
    <div class="h-screen flex bg-white">
      {/* Sidebar */}
      <div
        class={`fixed md:relative inset-y-0 left-0 transform ${
          state.isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        } w-72 bg-gray-900 text-white transition-transform duration-200 ease-in-out z-50`}
      >
        <div class="flex flex-col h-full">
          {/* Sidebar Header */}
          <div class="p-4 flex justify-between items-center border-b border-gray-700">
            <h1 class="text-xl font-bold">Cortex</h1>
            <button
              onClick={() => actions.createNewSession()}
              class="p-2 hover:bg-gray-700 rounded-lg"
              title="New Chat"
              disabled={state.ollamaStatus !== "connected"}
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Ollama Status */}
          <div class="px-4 py-2 border-b border-gray-700">
            <div class="flex items-center space-x-2">
              {state.ollamaStatus === "connected" ? (
                <>
                  <CheckCircle2 size={16} class="text-green-500" />
                  <span class="text-sm text-green-500">Ollama Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} class="text-red-500" />
                  <span class="text-sm text-red-500">Ollama Disconnected</span>
                </>
              )}
            </div>
          </div>

          {/* Model Selector */}
          <Show when={state.ollamaStatus === "connected"}>
            <div class="p-4 border-b border-gray-700">
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Model
              </label>
              <ModelSelector
                currentModel={state.currentModel}
                onModelSelect={(model) => {
                  actions.setCurrentModel(model);
                  if (state.currentSessionId) {
                    actions.updateSessionModel(state.currentSessionId, model);
                  }
                }}
              />
            </div>
          </Show>

          {/* Chat Sessions */}
          <div class="flex-1 overflow-y-auto">
            <For each={state.sessions}>
              {(session) => (
                <div
                  class={`group p-3 flex justify-between items-center cursor-pointer hover:bg-gray-700 ${
                    session.id === state.currentSessionId ? "bg-gray-700" : ""
                  }`}
                  onClick={() => actions.setCurrentSession(session.id)}
                >
                  <div class="flex items-center space-x-3 flex-1 min-w-0">
                    <MessageCircle size={16} />
                    <span class="truncate">{session.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.deleteSession(session.id);
                    }}
                    class="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded"
                    title="Delete chat"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </For>
          </div>

          {/* Sidebar Footer */}
          <div class="p-4 border-t border-gray-700">
            <button
              onClick={() => actions.toggleSettings()}
              class="flex items-center space-x-2 text-sm text-gray-400 hover:text-white w-full"
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div class="flex-1 flex flex-col">
        {/* Header */}
        <div class="h-14 border-b border-gray-200 flex items-center px-4">
          <button
            onClick={() => actions.toggleSidebar()}
            class="p-2 hover:bg-gray-100 rounded-lg md:hidden"
          >
            <Menu size={20} />
          </button>
          <h2 class="ml-4 font-semibold">
            {currentSession()?.title || "New Chat"}
          </h2>
        </div>

        {/* Chat Window */}
        <ChatWindow
          session={currentSession()}
          streamingContent={streamContent()}
          isLoading={isStreaming()}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Settings Panel */}
      <Show when={state.isSettingsOpen}>
        <div class="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div class="absolute right-0 inset-y-0 w-80 bg-white p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold">Settings</h2>
              <button
                onClick={() => actions.toggleSettings()}
                class="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <h3 class="font-medium mb-2">Model Parameters</h3>
                {/* Add model parameters controls here */}
              </div>
              <div>
                <h3 class="font-medium mb-2">Interface</h3>
                {/* Add interface settings here */}
              </div>
            </div>
          </div>
        </div>
      </Show>

      {/* Error Display */}
      <Show when={state.error}>
        <div class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center space-x-2">
          <AlertCircle size={20} />
          <div>
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline"> {state.error?.message}</span>
          </div>
          <button
            onClick={() => actions.setError(null)}
            class="ml-2 hover:bg-red-200 rounded p-1"
          >
            <X size={16} />
          </button>
        </div>
      </Show>

      {/* Loading Indicator */}
      <Show when={state.isLoading}>
        <div class="fixed bottom-4 left-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded flex items-center space-x-2">
          <Loader2 size={20} class="animate-spin" />
          <span>Processing...</span>
        </div>
      </Show>
    </div>
  );
}
