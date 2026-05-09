// @ai-radio/brain — Mood engine types
// ===================================================================

import { z } from 'zod';

export const MoodStateSchema = z.object({
  valence: z.number().min(-1).max(1),
  energy: z.number().min(-1).max(1),
  label: z.enum(['chill', 'energetic', 'melancholy', 'cheerful', 'neutral']),
  confidence: z.number().min(0).max(1),
  updatedAt: z.string().datetime(),
});

export type MoodState = z.infer<typeof MoodStateSchema>;

export const DEFAULT_MOOD: MoodState = {
  valence: 0,
  energy: 0,
  label: 'neutral',
  confidence: 1.0,
  updatedAt: new Date().toISOString(),
};
