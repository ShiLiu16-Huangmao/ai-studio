// @ai-radio/shared — Unified package entry point
// ===================================================================

// ===================================================================
// Zod Schemas (runtime validation)
// ===================================================================
export {
  // AI
  MoodTypeSchema,
  ThinkingStateSchema,
  AIStateSchema,
  AIActionSchema,
  AIResponseSchema,
  // Chat
  ChatRoleSchema,
  ChatMessageSchema,
  ChatEventTypeSchema,
  ChatEventSchema,
  ChatSendInputSchema,
  CreateConversationInputSchema,
  ConversationSchema,
  // Music
  MusicSourceSchema,
  SongSchema,
  PlaylistSchema,
  NowPlayingSchema,
  PlayerStateSchema,
  PlayerActionSchema,
  // Audio
  AudioContainerSchema,
  AudioFormatSchema,
  TTSRequestSchema,
  AudioChunkSchema,
  AudioQueueSchema,
  DuckingStateSchema,
  // Weather
  WeatherInfoSchema,
  WeatherMoodSchema,
  // Schedule
  ScheduleItemSchema,
  // Memory
  MemoryTypeSchema,
  UserMemorySchema,
  MoodMemorySchema,
  RecentContextSchema,
  // WebSocket
  WSEventEnvelopeSchema,
  ChatMessagePayloadSchema,
  ChatStopPayloadSchema,
  PlayerActionPayloadSchema,
  PlayerQueuePayloadSchema,
  UserPresencePayloadSchema,
  UserPreferencePayloadSchema,
  PingPayloadSchema,
  ChatTokenPayloadSchema,
  ChatDonePayloadSchema,
  ChatActionPayloadSchema,
  AudioStartPayloadSchema,
  AudioChunkPayloadSchema,
  AudioEndPayloadSchema,
  MusicTrackPayloadSchema,
  MusicPlaylistPayloadSchema,
  WeatherUpdatePayloadSchema,
  ScheduleUpdatePayloadSchema,
  DJStatePayloadSchema,
  DJMoodPayloadSchema,
  ErrorPayloadSchema,
  SystemEventPayloadSchema,
  ConnectedPayloadSchema,
  PongPayloadSchema,
  ClientToServerEventMap,
  ServerToClientEventMap,
} from './schemas';

// ===================================================================
// Inferred Types (compile-time)
// ===================================================================
export type {
  MoodType,
  ThinkingState,
  AIState,
  AIAction,
  AIResponse,
  ChatRole,
  ChatMessage,
  ChatEventType,
  ChatEvent,
  ChatSendInput,
  CreateConversationInput,
  Conversation,
  MusicSource,
  Song,
  Playlist,
  NowPlaying,
  PlayerState,
  PlayerAction,
  AudioContainer,
  AudioFormat,
  TTSRequest,
  AudioChunk,
  AudioQueue,
  DuckingState,
  WeatherInfo,
  WeatherMood,
  ScheduleItem,
  MemoryType,
  UserMemory,
  MoodMemory,
  RecentContext,
  WSEventEnvelope,
} from './types';

// ===================================================================
// Event String Constants
// ===================================================================
export { ClientEvents, ServerEvents, ALL_EVENTS } from './events';
export type { ClientEventType, ServerEventType } from './events';

// ===================================================================
// Application Constants
// ===================================================================
export {
  APP_NAME,
  DEFAULT_DJ_NAME,
  DEFAULT_TIMEZONE,
  PORTS,
  WS_PATH,
  AUDIO_FORMAT,
  DUCKING,
  STREAMING,
  MEMORY,
  SYSTEM_PROMPT,
  RECONNECT,
  HEARTBEAT,
  RATE_LIMIT,
} from './constants';
