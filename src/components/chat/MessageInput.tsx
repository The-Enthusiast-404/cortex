// src/components/chat/MessageInput.tsx
import { createSignal } from "solid-js";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled: boolean;
}

export function MessageInput(props: MessageInputProps) {
  const [message, setMessage] = createSignal("");

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const content = message().trim();
    if (content && !props.disabled) {
      props.onSendMessage(content);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} class="p-4 border-t border-gray-200">
      <div class="flex space-x-4">
        <input
          type="text"
          value={message()}
          onInput={(e) => setMessage(e.currentTarget.value)}
          placeholder="Type your message..."
          disabled={props.disabled}
          class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={props.disabled}
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </form>
  );
}
