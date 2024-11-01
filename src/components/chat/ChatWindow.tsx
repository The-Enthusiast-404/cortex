// src/components/chat/ChatWindow.tsx
import { Show, For } from "solid-js";
import { ChatSession } from "../../store/types";

interface ChatWindowProps {
  session: ChatSession | null;
  streamingContent: string;
  isLoading: boolean;
  onSendMessage: (content: string) => void;
}

export function ChatWindow(props: ChatWindowProps) {
  return (
    <div class="flex-1 flex flex-col h-full">
      <Show
        when={props.session}
        fallback={
          <div class="flex items-center justify-center h-full text-gray-500">
            Select or create a chat to get started
          </div>
        }
      >
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <For each={props.session?.messages}>
            {(message) => (
              <div
                class={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  class={`max-w-[70%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            )}
          </For>
          <Show when={props.streamingContent}>
            <div class="flex justify-start">
              <div class="max-w-[70%] rounded-lg p-3 bg-gray-200 text-gray-900">
                {props.streamingContent}
                <span class="inline-block w-2 h-4 ml-1 bg-gray-500 animate-pulse" />
              </div>
            </div>
          </Show>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.querySelector(
              "input"
            ) as HTMLInputElement;
            const content = input.value.trim();
            if (content) {
              props.onSendMessage(content);
              input.value = "";
            }
          }}
          class="p-4 border-t border-gray-200"
        >
          <div class="flex space-x-4">
            <input
              type="text"
              placeholder="Type your message..."
              disabled={props.isLoading}
              class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={props.isLoading}
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </Show>
    </div>
  );
}
