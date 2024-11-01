// src/components/chat/MessageList.tsx
import { For, Show } from "solid-js";
import { Message } from "../../store/types";

interface MessageListProps {
  messages: Message[];
  streamingContent: string;
}

export function MessageList(props: MessageListProps) {
  return (
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <For each={props.messages}>
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
  );
}
