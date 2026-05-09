// @ai-radio/web — Frontend types

import type { Song, MoodType, ThinkingState, AIState } from '@ai-radio/shared';

// Re-export shared types
export type { Song, MoodType, ThinkingState, AIState };

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export type AppMode = 'idle' | 'chatting' | 'playing';

export interface PlayerState {
  currentTrack: Song | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  isBuffering: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface DJState {
  status: 'online' | 'broadcasting' | 'resting';
  mood: MoodType;
  thinking: ThinkingState;
  currentSegment: string | null;
}

export interface WeatherInfo {
  temperature: number;
  condition: string;
  city: string;
  updatedAt: string;
}
