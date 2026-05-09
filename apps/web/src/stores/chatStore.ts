// @ai-radio/web — Chat state
// ===================================================================

import { create } from 'zustand';
import type { ChatMessage } from '../types';

interface ChatState {
  /** All messages in current conversation */
  messages: ChatMessage[];

  /** Is currently streaming AI response */
  isStreaming: boolean;

  /** Text being streamed token-by-token */
  streamingText: string;

  // Actions
  addMessage: (msg: ChatMessage) => void;
  setStreaming: (streaming: boolean) => void;
  appendStreamingText: (token: string) => void;
  commitStreamingText: () => void;
  clearChat: () => void;
}

let messageCounter = 0;

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  streamingText: '',

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  appendStreamingText: (token) =>
    set((s) => ({ streamingText: s.streamingText + token })),

  commitStreamingText: () => {
    const { streamingText } = get();
    if (!streamingText.trim()) return;
    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: `msg_${++messageCounter}`,
          role: 'assistant',
          content: streamingText,
          timestamp: Date.now(),
        },
      ],
      streamingText: '',
      isStreaming: false,
    }));
  },

  clearChat: () => set({ messages: [], streamingText: '', isStreaming: false }),
}));
