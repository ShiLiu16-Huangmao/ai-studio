// @ai-radio/prompts — Prompt module types
// ===================================================================

import { z } from 'zod';

// ===================================================================
// Time of Day
// ===================================================================

export const TimeOfDaySchema = z.enum([
  'late_night', // 0-6  深夜
  'morning',    // 6-9  清晨
  'daytime',    // 9-17 白天
  'evening',    // 17-21 傍晚
  'night',      // 21-24 夜晚
]);
export type TimeOfDay = z.infer<typeof TimeOfDaySchema>;

// ===================================================================
// Prompt Context (unified input for all modules)
// ===================================================================

export const PromptContextSchema = z.object({
  /** DJ name */
  djName: z.string().default('夜汐'),

  /** Current time info */
  time: z.object({
    iso: z.string(),
    timeOfDay: TimeOfDaySchema,
    dayOfWeek: z.string(),
    hour: z.number().int().min(0).max(23),
  }),

  /** Current weather */
  weather: z
    .object({
      temperature: z.number(),
      condition: z.string(),
      city: z.string(),
    })
    .nullable(),

  /** User's current mood */
  mood: z.object({
    label: z.enum(['chill', 'energetic', 'melancholy', 'cheerful', 'neutral']),
    valence: z.number().min(-1).max(1),
    energy: z.number().min(-1).max(1),
  }),

  /** Relevant recalled memories */
  memories: z.array(
    z.object({
      content: z.string(),
      type: z.string(),
      createdAt: z.string(),
    }),
  ),

  /** Recent topics */
  recentTopics: z.array(z.string()),

  /** Upcoming schedule items */
  schedule: z.array(
    z.object({
      title: z.string(),
      time: z.string(),
    }),
  ),

  /** Current conversation history (last N messages) */
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    }),
  ),
});
export type PromptContext = z.infer<typeof PromptContextSchema>;

// ===================================================================
// Prompt Module
// ===================================================================

/**
 * A PromptModule is a function that takes context and returns a
 * prompt block string (or null if the module should be skipped).
 *
 * Modules are the building blocks of the system prompt.
 * They are assembled in order to form the complete prompt.
 */
export interface PromptModule {
  /** Unique module name */
  name: string;

  /** Priority (lower = earlier in the prompt) */
  priority: number;

  /**
   * Render this module's prompt block.
   * Returns null if this module should be skipped for the current context.
   */
  render(ctx: PromptContext): string | null;
}

// ===================================================================
// Assembled Prompt
// ===================================================================

export interface AssembledPrompt {
  /** Complete assembled system prompt */
  systemPrompt: string;

  /** Individual module blocks (for debugging) */
  blocks: Array<{ module: string; content: string }>;

  /** Metadata about the assembly */
  meta: {
    activeModules: string[];
    skippedModules: string[];
    promptLength: number;
  };
}
