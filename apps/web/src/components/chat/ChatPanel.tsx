// @ai-radio/web — Chat message list panel
// ===================================================================

import { useChatStore } from '../../stores/chatStore';
import { ChatBubble } from './ChatBubble';

export function ChatPanel(): JSX.Element {
  const messages = useChatStore((s) => s.messages);
  const streamingText = useChatStore((s) => s.streamingText);

  if (messages.length === 0 && !streamingText) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-text-muted text-xs space-y-2">
        <span>🎙️</span>
        <p>夜汐在听，随时可以说话</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
      {/* Streaming text bubble */}
      {streamingText && (
        <ChatBubble
          message={{
            id: 'streaming',
            role: 'assistant',
            content: streamingText + '▍',
            timestamp: Date.now(),
          }}
        />
      )}
    </div>
  );
}
