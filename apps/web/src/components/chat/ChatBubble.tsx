// @ai-radio/web — Single chat message bubble
// ===================================================================

import type { ChatMessage } from '../../types';

interface Props {
  message: ChatMessage;
}

export function ChatBubble({ message }: Props): JSX.Element {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-accent-dim text-accent border border-accent/20 rounded-br-md'
            : 'glass-elevated text-text-primary rounded-bl-md'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
