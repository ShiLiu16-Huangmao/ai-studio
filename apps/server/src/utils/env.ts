// @ai-radio/server — Environment variables with validation
// ===================================================================

import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env at module init
dotenv.config();

const envSchema = z.object({
  /** Server listen port */
  RADIO_SERVER_PORT: z.coerce.number().int().min(1024).max(65535).default(3001),

  /** Allowed CORS origin */
  RADIO_CLIENT_ORIGIN: z.string().default('http://localhost:5173'),

  /** Log level */
  RADIO_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  /** Node environment */
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // --- External API keys (mock for MVP) ---
  RADIO_CLAUDE_API_KEY: z.string().optional(),
  RADIO_FISH_AUDIO_API_KEY: z.string().optional(),
  RADIO_NETEASE_API_KEY: z.string().optional(),
  RADIO_WEATHER_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
