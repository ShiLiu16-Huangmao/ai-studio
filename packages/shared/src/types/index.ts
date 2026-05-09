// @ai-radio/shared — Type-only re-exports (derived from Zod schemas)
// ===================================================================
// 此文件中的所有类型均由 Zod schema 自动推导
// 不需要手写任何 interface 或 type
// ===================================================================

// --- AI ---
export type {
  MoodType,
  ThinkingState,
  AIState,
  AIAction,
  AIResponse,
} from '../schemas/ai';

// --- Chat ---
export type {
  ChatRole,
  ChatMessage,
  ChatEventType,
  ChatEvent,
  ChatSendInput,
  CreateConversationInput,
  Conversation,
} from '../schemas/chat';

// --- Music ---
export type {
  MusicSource,
  Song,
  Playlist,
  NowPlaying,
  PlayerState,
  PlayerAction,
} from '../schemas/music';

// --- Audio ---
export type {
  AudioContainer,
  AudioFormat,
  TTSRequest,
  AudioChunk,
  AudioQueue,
  DuckingState,
} from '../schemas/audio';

// --- Weather ---
export type { WeatherInfo, WeatherMood } from '../schemas/weather';

// --- Memory ---
export type {
  MemoryType,
  UserMemory,
  MoodMemory,
  RecentContext,
} from '../schemas/memory';

// --- Schedule ---
export type { ScheduleItem } from '../schemas/schedule';

// --- WebSocket ---
export type { WSEventEnvelope } from '../schemas/ws';
