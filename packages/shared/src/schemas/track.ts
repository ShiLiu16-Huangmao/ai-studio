// @ai-radio/shared — Track & play history schemas

import { z } from 'zod';
import { TrackSourceSchema } from './enums';

// ==================== Track ====================
export const TrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  artist: z.string(),
  album: z.string(),
  coverUrl: z.string().url(),
  mp3Url: z.string().url(),
  duration: z.number().positive(),
  source: TrackSourceSchema,
});
export type Track = z.infer<typeof TrackSchema>;

// ==================== Play History ====================
export const PlayHistoryItemSchema = z.object({
  id: z.string(),
  trackId: z.string(),
  trackName: z.string(),
  artist: z.string(),
  album: z.string().nullable(),
  coverUrl: z.string().url().nullable(),
  source: TrackSourceSchema,
  playedAt: z.string().datetime(),
});
export type PlayHistoryItem = z.infer<typeof PlayHistoryItemSchema>;

// ==================== Music Recommendation ====================
export const RecommendInputSchema = z.object({
  query: z.string().optional(),
  mood: z.string().optional(),
  genres: z.array(z.string()).optional(),
  excludeIds: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(20).default(5),
});
export type RecommendInput = z.infer<typeof RecommendInputSchema>;

export const RecommendResultSchema = z.object({
  tracks: z.array(TrackSchema),
  reason: z.string(),
  mood: z.string().nullable(),
});
export type RecommendResult = z.infer<typeof RecommendResultSchema>;
