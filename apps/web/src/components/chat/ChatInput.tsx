// @ai-radio/web — Chat message input
// ===================================================================

import { useState, useRef, useEffect } from 'react';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: Props): JSX.Element {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus on mount
    inputRef.current?.focus();
  }, []);

  const handleSend = (): void => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder ?? '和夜汐说点什么...'}
        className="chat-input flex-1"
        maxLength={5000}
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="w-10 h-10 rounded-xl bg-accent-dim text-accent flex items-center justify-center
          hover:bg-accent hover:text-bg transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
        aria-label="发送"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  );
}
