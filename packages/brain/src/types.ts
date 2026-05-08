// @ai-radio/brain — Brain types

import type { MoodState, MoodLabel, MemoryEntry, WeatherData, ScheduleItem, Track } from '@ai-radio/shared';

/** Static configuration for the DJ Brain */
export interface BrainConfig {
  djName: string;
  voiceId: string;
  timezone: string;
}

/** All context assembled for one turn of conversation */
export interface AssembledContext {
  systemPrompt: string;
  messages: ChatMessage[];
  mood: MoodState;
  weather: WeatherData | null;
  schedule: ScheduleItem[];
  memories: MemoryEntry[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/** Callbacks for streaming responses */
export interface StreamCallbacks {
  onToken: (token: string, index: number) => void;
  onAction?: (action: string, params: Record<string, unknown>) => void;
  onMusicRecommend?: (tracks: Track[], reason: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
}

/** Result of mood analysis */
export interface MoodAnalysis {
  label: MoodLabel;
  valence: number;
  energy: number;
  confidence: number;
}
