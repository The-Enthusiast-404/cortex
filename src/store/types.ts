// src/store/types.ts
export type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Model = {
  name: string;
  status: "ready" | "downloading" | "not-downloaded";
  size?: string;
};

export type StreamingResponse = {
  response: string;
  done: boolean;
};

export type OllamaStatus = "connected" | "disconnected" | "checking";
