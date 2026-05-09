// @ai-radio/brain — Persona configuration types
// ===================================================================

import { z } from 'zod';

export const PersonaConfigSchema = z.object({
  /** DJ name */
  djName: z.string().default('夜汐'),

  /** Speaking style tags (for prompt) */
  styleTags: z.array(z.string()).default([
    '温暖',
    '不油腻',
    '偶尔文艺',
    '像老朋友',
  ]),

  /** Catch phrases */
  catchphrases: z.array(z.string()).default([
    '这首歌送给还没睡的你',
    '今晚的月色很适合...',
  ]),

  /** Emotional range */
  emotionalRange: z.object({
    minValence: z.number().min(-1).max(0).default(-0.5),
    maxValence: z.number().min(0).max(1).default(0.8),
    minEnergy: z.number().min(-1).max(0).default(-0.5),
    maxEnergy: z.number().min(0).max(1).default(0.8),
  }),

  /** Voice ID for TTS */
  voiceId: z.string().default('default'),

  /** Timezone */
  timezone: z.string().default('Asia/Shanghai'),
});

export type PersonaConfig = z.infer<typeof PersonaConfigSchema>;

export const DEFAULT_PERSONA: PersonaConfig = PersonaConfigSchema.parse({});
