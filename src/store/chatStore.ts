// src/store/chatStore.ts
import { createStore } from "solid-js/store";
import { ChatSession, Message, Model } from "./types";

type State = {
  sessions: ChatSession[];
  currentSessionId: string | null;
  models: Model[];
  currentModel: string;
  isSidebarOpen: boolean;
  isSettingsOpen: boolean;
  isLoading: boolean;
  streamingContent: string;
  error: Error | null;
  ollamaStatus: "connected" | "disconnected" | "checking";
};

export function createChatStore() {
  const [state, setState] = createStore<State>({
    sessions: [],
    currentSessionId: null,
    models: [],
    currentModel: "llama2",
    isSidebarOpen: true,
    isSettingsOpen: false,
    isLoading: false,
    streamingContent: "",
    error: null,
    ollamaStatus: "checking",
  });

  const actions = {
    createNewSession() {
      const newSession: ChatSession = {
        id: crypto.randomUUID(),
        title: "New Chat",
        messages: [],
        model: state.currentModel,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setState("sessions", [...state.sessions, newSession]);
      setState("currentSessionId", newSession.id);
      this.saveToStorage();
    },

    deleteSession(id: string) {
      setState(
        "sessions",
        state.sessions.filter((s) => s.id !== id)
      );
      if (state.currentSessionId === id) {
        setState("currentSessionId", state.sessions[0]?.id || null);
      }
      this.saveToStorage();
    },

    addMessage(sessionId: string, message: Message) {
      setState(
        "sessions",
        state.sessions.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: [...s.messages, message],
                updatedAt: new Date(),
                title:
                  s.messages.length === 0
                    ? this.generateTitle(message.content)
                    : s.title,
              }
            : s
        )
      );
      this.saveToStorage();
    },

    updateStreamingContent(content: string) {
      setState("streamingContent", content);
    },

    setCurrentSession(id: string) {
      setState("currentSessionId", id);
    },

    setCurrentModel(model: string) {
      setState("currentModel", model);
      localStorage.setItem("current_model", model);
    },

    updateSessionModel(sessionId: string, model: string) {
      setState(
        "sessions",
        state.sessions.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                model,
                updatedAt: new Date(),
              }
            : s
        )
      );
      this.saveToStorage();
    },

    toggleSidebar() {
      setState("isSidebarOpen", !state.isSidebarOpen);
    },

    toggleSettings() {
      setState("isSettingsOpen", !state.isSettingsOpen);
    },

    setLoading(loading: boolean) {
      setState("isLoading", loading);
    },

    setError(error: Error | null) {
      setState("error", error);
    },

    setOllamaStatus(status: "connected" | "disconnected" | "checking") {
      setState("ollamaStatus", status);
    },

    generateTitle(content: string): string {
      return content.slice(0, 30) + (content.length > 30 ? "..." : "");
    },

    saveToStorage() {
      localStorage.setItem("chat_sessions", JSON.stringify(state.sessions));
    },

    loadFromStorage() {
      // Load saved sessions
      const saved = localStorage.getItem("chat_sessions");
      if (saved) {
        const sessions = JSON.parse(saved);
        setState("sessions", sessions);
        if (sessions.length > 0) {
          setState("currentSessionId", sessions[0].id);
        }
      }

      // Load saved model preference
      const savedModel = localStorage.getItem("current_model");
      if (savedModel) {
        setState("currentModel", savedModel);
      }
    },
  };

  return { state, actions };
}
