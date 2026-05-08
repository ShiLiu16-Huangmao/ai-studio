// @ai-radio/shared — Mood & emotion schemas

import { z } from 'zod';
import { MoodLabelSchema } from './enums';

// ==================== Mood State ====================
export const MoodStateSchema = z.object({
  valence: z.number().min(-1).max(1),
  energy: z.number().min(-1).max(1),
  label: MoodLabelSchema,
  confidence: z.number().min(0).max(1),
  updatedAt: z.string().datetime(),
});
export type MoodState = z.infer<typeof MoodStateSchema>;

// ==================== Mood Record ====================
export const MoodRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  mood: MoodLabelSchema,
  source: z.enum(['user_stated', 'detected', 'system']),
  context: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type MoodRecord = z.infer<typeof MoodRecordSchema>;

// ==================== Mood Analysis Result ====================
export const MoodAnalysisSchema = z.object({
  label: MoodLabelSchema,
  valence: z.number().min(-1).max(1),
  energy: z.number().min(-1).max(1),
  confidence: z.number().min(0).max(1),
});
export type MoodAnalysis = z.infer<typeof MoodAnalysisSchema>;
