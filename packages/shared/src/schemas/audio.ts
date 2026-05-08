// @ai-radio/shared — Audio & TTS schemas

import { z } from 'zod';
import { AudioContainerSchema } from './enums';

// ==================== Audio Format ====================
export const AudioFormatSchema = z.object({
  container: AudioContainerSchema,
  sampleRate: z.number().int().positive(),
  channels: z.number().int().min(1).max(2),
  bitrate: z.number().int().positive(),
});
export type AudioFormat = z.infer<typeof AudioFormatSchema>;

// ==================== TTS Request ====================
export const TTSRequestSchema = z.object({
  text: z.string().min(1).max(500),
  voiceId: z.string(),
  format: AudioFormatSchema,
});
export type TTSRequest = z.infer<typeof TTSRequestSchema>;

// ==================== TTS Chunk ====================
export const TTSChunkSchema = z.object({
  sequence: z.number().int().min(0),
  data: z.string(),
  sentence: z.string(),
  format: AudioFormatSchema,
});
export type TTSChunk = z.infer<typeof TTSChunkSchema>;

// ==================== TTS Response ====================
export const TTSResponseSchema = z.object({
  messageId: z.string(),
  chunkCount: z.number().int().min(0),
});
export type TTSResponse = z.infer<typeof TTSResponseSchema>;

// ==================== Voice Info ====================
export const VoiceInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  language: z.string(),
});
export type VoiceInfo = z.infer<typeof VoiceInfoSchema>;
