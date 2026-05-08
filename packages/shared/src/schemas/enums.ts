// @ai-radio/shared — Zod enum schemas

import { z } from 'zod';

// ==================== Mood ====================
export const MoodLabelSchema = z.enum([
  'chill',
  'energetic',
  'melancholy',
  'cheerful',
  'neutral',
]);
export type MoodLabel = z.infer<typeof MoodLabelSchema>;

// ==================== DJ ====================
export const DJStatusSchema = z.enum(['online', 'broadcasting', 'resting']);
export type DJStatus = z.infer<typeof DJStatusSchema>;

// ==================== Memory ====================
export const MemoryTypeSchema = z.enum([
  'fact',
  'preference',
  'event',
  'emotion',
  'relationship',
]);
export type MemoryType = z.infer<typeof MemoryTypeSchema>;

// ==================== Message ====================
export const MessageRoleSchema = z.enum(['user', 'assistant', 'system']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

// ==================== Music ====================
export const TrackSourceSchema = z.enum(['netease', 'local']);
export type TrackSource = z.infer<typeof TrackSourceSchema>;

// ==================== Player ====================
export const PlayerActionSchema = z.enum(['play', 'pause', 'skip', 'seek']);
export type PlayerAction = z.infer<typeof PlayerActionSchema>;

// ==================== Connection ====================
export const ConnectionStatusSchema = z.enum([
  'connecting',
  'connected',
  'disconnected',
]);
export type ConnectionStatus = z.infer<typeof ConnectionStatusSchema>;

// ==================== App ====================
export const AppModeSchema = z.enum(['idle', 'chatting', 'playing']);
export type AppMode = z.infer<typeof AppModeSchema>;

// ==================== Audio ====================
export const AudioContainerSchema = z.enum(['mp3', 'pcm', 'wav']);
export type AudioContainer = z.infer<typeof AudioContainerSchema>;

// ==================== Repeat ====================
export const RepeatTypeSchema = z.enum(['daily', 'weekly', 'none']);
export type RepeatType = z.infer<typeof RepeatTypeSchema>;
