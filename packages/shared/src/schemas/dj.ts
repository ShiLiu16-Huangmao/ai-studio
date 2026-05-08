// @ai-radio/shared — DJ persona & preference schemas

import { z } from 'zod';
import { DJStatusSchema, MoodLabelSchema } from './enums';

// ==================== DJ State ====================
export const DJStateSchema = z.object({
  status: DJStatusSchema,
  mood: MoodLabelSchema,
  currentSegment: z.string().nullable(),
});
export type DJState = z.infer<typeof DJStateSchema>;

// ==================== User Preference ====================
export const UserPreferenceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  musicGenres: z.array(z.string()),
  voiceId: z.string().nullable(),
  djName: z.string(),
  timezone: z.string().default('Asia/Shanghai'),
  location: z.string().nullable(),
});
export type UserPreference = z.infer<typeof UserPreferenceSchema>;

// ==================== Update Preference Input ====================
export const UpdatePreferenceInputSchema = z.object({
  musicGenres: z.array(z.string()).optional(),
  voiceId: z.string().nullable().optional(),
  djName: z.string().min(1).max(30).optional(),
  timezone: z.string().optional(),
  location: z.string().nullable().optional(),
});
export type UpdatePreferenceInput = z.infer<typeof UpdatePreferenceInputSchema>;
