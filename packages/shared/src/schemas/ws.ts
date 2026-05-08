// @ai-radio/shared — WebSocket event payload schemas

import { z } from 'zod';
import { TrackSchema } from './track';
import { WeatherDataSchema } from './weather';
import { ScheduleItemSchema } from './schedule';
import { DJStateSchema } from './dj';
import { MoodLabelSchema, PlayerActionSchema } from './enums';
import { AudioFormatSchema } from './audio';

// ==================== Generic WS Event Envelope ====================
export const WSEventSchema = z.object({
  type: z.string(),
  payload: z.unknown(),
  timestamp: z.number(),
  seq: z.number().int().min(0),
});
export type WSEvent = z.infer<typeof WSEventSchema>;

// ==================== Client → Server Payloads ====================

export const ChatMessagePayloadSchema = z.object({
  conversationId: z.string(),
  text: z.string().min(1).max(5000),
});
export type ChatMessagePayload = z.infer<typeof ChatMessagePayloadSchema>;

export const ChatTypingPayloadSchema = z.object({
  conversationId: z.string(),
});
export type ChatTypingPayload = z.infer<typeof ChatTypingPayloadSchema>;

export const ChatStopPayloadSchema = z.object({
  conversationId: z.string(),
});
export type ChatStopPayload = z.infer<typeof ChatStopPayloadSchema>;

export const PlayerActionPayloadSchema = z.object({
  action: PlayerActionSchema,
  value: z.number().optional(),
  trackId: z.string().optional(),
});
export type PlayerActionPayload = z.infer<typeof PlayerActionPayloadSchema>;

export const PlayerSyncPayloadSchema = z.object({});
export type PlayerSyncPayload = z.infer<typeof PlayerSyncPayloadSchema>;

export const PlayerQueuePayloadSchema = z.object({
  tracks: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      artist: z.string(),
      mp3Url: z.string().url(),
      duration: z.number().positive(),
    }),
  ),
  action: z.enum(['add', 'remove', 'replace', 'clear']),
});
export type PlayerQueuePayload = z.infer<typeof PlayerQueuePayloadSchema>;

export const UserPresencePayloadSchema = z.object({
  status: z.enum(['online', 'away']),
});
export type UserPresencePayload = z.infer<typeof UserPresencePayloadSchema>;

export const UserPreferencePayloadSchema = z.object({
  key: z.string(),
  value: z.unknown(),
});
export type UserPreferencePayload = z.infer<typeof UserPreferencePayloadSchema>;

export const PingPayloadSchema = z.object({});
export type PingPayload = z.infer<typeof PingPayloadSchema>;

// ==================== Server → Client Payloads ====================

export const ChatTokenPayloadSchema = z.object({
  conversationId: z.string(),
  messageId: z.string(),
  token: z.string(),
  index: z.number().int().min(0),
});
export type ChatTokenPayload = z.infer<typeof ChatTokenPayloadSchema>;

export const ChatDonePayloadSchema = z.object({
  conversationId: z.string(),
  messageId: z.string(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
});
export type ChatDonePayload = z.infer<typeof ChatDonePayloadSchema>;

export const ChatActionPayloadSchema = z.object({
  action: z.string(),
  params: z.record(z.string(), z.unknown()),
});
export type ChatActionPayload = z.infer<typeof ChatActionPayloadSchema>;

export const AudioStartPayloadSchema = z.object({
  conversationId: z.string(),
  messageId: z.string(),
  format: AudioFormatSchema,
});
export type AudioStartPayload = z.infer<typeof AudioStartPayloadSchema>;

export const AudioChunkPayloadSchema = z.object({
  conversationId: z.string(),
  messageId: z.string(),
  data: z.string(),
  sequence: z.number().int().min(0),
  sentence: z.string(),
  format: z.string(),
});
export type AudioChunkPayload = z.infer<typeof AudioChunkPayloadSchema>;

export const AudioEndPayloadSchema = z.object({
  conversationId: z.string(),
  messageId: z.string(),
});
export type AudioEndPayload = z.infer<typeof AudioEndPayloadSchema>;

export const MusicTrackPayloadSchema = z.object({
  track: TrackSchema,
  recommendReason: z.string().optional(),
});
export type MusicTrackPayload = z.infer<typeof MusicTrackPayloadSchema>;

export const MusicPlaylistPayloadSchema = z.object({
  tracks: z.array(TrackSchema),
  title: z.string(),
  context: z.string(),
});
export type MusicPlaylistPayload = z.infer<typeof MusicPlaylistPayloadSchema>;

export const WeatherUpdatePayloadSchema = z.object({
  weather: WeatherDataSchema,
});
export type WeatherUpdatePayload = z.infer<typeof WeatherUpdatePayloadSchema>;

export const ScheduleUpdatePayloadSchema = z.object({
  items: z.array(ScheduleItemSchema),
});
export type ScheduleUpdatePayload = z.infer<typeof ScheduleUpdatePayloadSchema>;

export const DJStatePayloadSchema = DJStateSchema;
export type DJStatePayload = z.infer<typeof DJStatePayloadSchema>;

export const DJMoodPayloadSchema = z.object({
  mood: MoodLabelSchema,
  reason: z.string().optional(),
});
export type DJMoodPayload = z.infer<typeof DJMoodPayloadSchema>;

export const SystemEventPayloadSchema = z.object({
  event: z.string(),
  message: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});
export type SystemEventPayload = z.infer<typeof SystemEventPayloadSchema>;

export const ErrorPayloadSchema = z.object({
  code: z.string(),
  message: z.string(),
  recoverable: z.boolean(),
});
export type ErrorPayload = z.infer<typeof ErrorPayloadSchema>;

export const PongPayloadSchema = z.object({});
export type PongPayload = z.infer<typeof PongPayloadSchema>;

// ==================== Connected (initial state push) ====================
export const ConnectedPayloadSchema = z.object({
  serverVersion: z.string(),
  clientId: z.string(),
});
export type ConnectedPayload = z.infer<typeof ConnectedPayloadSchema>;
