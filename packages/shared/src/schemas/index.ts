// @ai-radio/shared — All Zod schema exports

export {
  MoodTypeSchema,
  ThinkingStateSchema,
  AIStateSchema,
  AIActionSchema,
  AIResponseSchema,
} from './ai';
export type { MoodType, ThinkingState, AIState, AIAction, AIResponse } from './ai';

export {
  ChatRoleSchema,
  ChatMessageSchema,
  ChatEventTypeSchema,
  ChatEventSchema,
  ChatSendInputSchema,
  CreateConversationInputSchema,
  ConversationSchema,
} from './chat';
export type {
  ChatRole,
  ChatMessage,
  ChatEventType,
  ChatEvent,
  ChatSendInput,
  CreateConversationInput,
  Conversation,
} from './chat';

export {
  MusicSourceSchema,
  SongSchema,
  PlaylistSchema,
  NowPlayingSchema,
  PlayerStateSchema,
  PlayerActionSchema,
} from './music';
export type {
  MusicSource,
  Song,
  Playlist,
  NowPlaying,
  PlayerState,
  PlayerAction,
} from './music';

export {
  AudioContainerSchema,
  AudioFormatSchema,
  TTSRequestSchema,
  AudioChunkSchema,
  AudioQueueSchema,
  DuckingStateSchema,
} from './audio';
export type {
  AudioContainer,
  AudioFormat,
  TTSRequest,
  AudioChunk,
  AudioQueue,
  DuckingState,
} from './audio';

export { WeatherInfoSchema, WeatherMoodSchema } from './weather';
export type { WeatherInfo, WeatherMood } from './weather';

export { ScheduleItemSchema } from './schedule';
export type { ScheduleItem } from './schedule';

export {
  MemoryTypeSchema,
  UserMemorySchema,
  MoodMemorySchema,
  RecentContextSchema,
} from './memory';
export type { MemoryType, UserMemory, MoodMemory, RecentContext } from './memory';

export {
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
} from './ws';
export type {
  WSEventEnvelope,
} from './ws';
