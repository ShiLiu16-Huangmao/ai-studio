// @ai-radio/shared — Schedule schemas

import { z } from 'zod';
import { RepeatTypeSchema } from './enums';

// ==================== Schedule Item ====================
export const ScheduleItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm format'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format')
    .nullable(),
  repeat: RepeatTypeSchema.nullable(),
  enabled: z.boolean(),
  createdAt: z.string().datetime(),
});
export type ScheduleItem = z.infer<typeof ScheduleItemSchema>;

// ==================== Create Schedule Input ====================
export const CreateScheduleInputSchema = z.object({
  title: z.string().min(1).max(200),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  repeat: RepeatTypeSchema.nullable().optional(),
});
export type CreateScheduleInput = z.infer<typeof CreateScheduleInputSchema>;

// ==================== Update Schedule Input ====================
export const UpdateScheduleInputSchema = CreateScheduleInputSchema.partial().extend({
  enabled: z.boolean().optional(),
});
export type UpdateScheduleInput = z.infer<typeof UpdateScheduleInputSchema>;
