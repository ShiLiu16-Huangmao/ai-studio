// @ai-radio/shared — Weather schemas

import { z } from 'zod';

export const WeatherDataSchema = z.object({
  temperature: z.number(),
  condition: z.string(),
  humidity: z.number().min(0).max(100),
  windLevel: z.number().int().min(0).max(12),
  city: z.string(),
  updatedAt: z.string().datetime(),
});
export type WeatherData = z.infer<typeof WeatherDataSchema>;
