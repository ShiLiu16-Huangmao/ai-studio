// @ai-radio/brain — Brain input/output type system
// ===================================================================

import { z } from 'zod';

// ===================================================================
// Input Types
// ===================================================================

/** Time context injected into every decision */
export const TimeContextSchema = z.object({
  /** ISO 8601 datetime */
  now: z.string().datetime(),
  /** 深夜 / 清晨 / 上午 / 中午 / 下午 / 傍晚 */
  timeOfDay: z.string(),
  /** 周一 ~ 周日 */
  dayOfWeek: z.string(),
});
export type TimeContext = z.infer<typeof TimeContextSchema>;

/** Weather snapshot (may be null) */
export const WeatherContextSchema = z
  .object({
    temperature: z.number(),
    condition: z.string(),
    city: z.string(),
  })
  .nullable();
export type WeatherContext = z.infer<typeof WeatherContextSchema>;

/** Recent memory + mood summary */
export const RecentContextSchema = z.object({
  /** Top-N relevant memories */
  memories: z.array(
    z.object({
      content: z.string(),
      type: z.string(),
      createdAt: z.string(),
    }),
  ),
  /** Recent mood records */
  moodHistory: z.array(
    z.object({
      mood: z.string(),
      valence: z.number(),
      energy: z.number(),
      createdAt: z.string(),
    }),
  ),
  /** Extracted key topics */
  recentTopics: z.array(z.string()),
});
export type RecentContext = z.infer<typeof RecentContextSchema>;

/** Current mood state (valence + energy vector) */
export const CurrentMoodSchema = z.object({
  valence: z.number().min(-1).max(1),
  energy: z.number().min(-1).max(1),
  label: z.enum(['chill', 'energetic', 'melancholy', 'cheerful', 'neutral']),
});
export type CurrentMood = z.infer<typeof CurrentMoodSchema>;

/** Complete brain input for one turn */
export const BrainInputSchema = z.object({
  /** User's raw message text */
  userMessage: z.string().min(1).max(5000),

  /** Current time context */
  currentTime: TimeContextSchema,

  /** Weather snapshot (null if unavailable) */
  weather: WeatherContextSchema,

  /** Recent memories + mood history */
  recentContext: RecentContextSchema,

  /** Current mood state */
  currentMood: CurrentMoodSchema,
});
export type BrainInput = z.infer<typeof BrainInputSchema>;

// ===================================================================
// Output Types
// ===================================================================

/** Speaking segment type */
export const SegmentTypeSchema = z.enum([
  'greeting',
  'observation',
  'memory_ref',
  'question',
  'music_recommend',
  'weather_report',
  'schedule_remind',
  'sign_off',
  'comment',
]);
export type SegmentType = z.infer<typeof SegmentTypeSchema>;

/** A single speaking segment */
export const SaySegmentSchema = z.object({
  /** Segment text */
  text: z.string(),
  /** Segment type for UI styling */
  type: SegmentTypeSchema,
});
export type SaySegment = z.infer<typeof SaySegmentSchema>;

/** Music recommendation */
export const MusicRecommendationSchema = z
  .object({
    /** Track name */
    trackName: z.string(),
    /** Artist */
    artist: z.string(),
    /** Recommendation reason (for DJ to say) */
    reason: z.string(),
    /** Suggested genre for searching */
    genre: z.string().optional(),
    /** Suggested mood tag */
    mood: z.string().optional(),
  })
  .nullable();
export type MusicRecommendation = z.infer<typeof MusicRecommendationSchema>;

/** Transition type between segments */
export const TransitionTypeSchema = z
  .enum([
    'greeting',
    'reply',
    'weather_intro',
    'schedule_intro',
    'music_intro',
    'farewell',
    'idle',
  ])
  .nullable();
export type TransitionType = z.infer<typeof TransitionTypeSchema>;

/** Mood decision — updated mood after this turn */
export const MoodDecisionSchema = z.object({
  valence: z.number().min(-1).max(1),
  energy: z.number().min(-1).max(1),
  label: z.enum(['chill', 'energetic', 'melancholy', 'cheerful', 'neutral']),
  /** Reason for mood change (for logging) */
  reason: z.string(),
});
export type MoodDecision = z.infer<typeof MoodDecisionSchema>;

/** Complete brain output — the DJ's decisions */
export const BrainOutputSchema = z.object({
  /** What the DJ should say */
  say: z.object({
    /** Full response text */
    text: z.string(),
    /** Structured segments for UI */
    segments: z.array(SaySegmentSchema),
  }),

  /** Updated mood state (with continuity) */
  mood: MoodDecisionSchema,

  /** Speaking energy level (0~1, affects TTS prosody) */
  energy: z.number().min(0).max(1),

  /** Music recommendation (null = none) */
  recommendSong: MusicRecommendationSchema,

  /** Context transition type */
  transition: TransitionTypeSchema,

  /** Metadata for logging */
  metadata: z.object({
    /** Token usage */
    tokensUsed: z.number().int().positive().optional(),
    /** Processing latency (ms) */
    latencyMs: z.number().optional(),
  }),
});
export type BrainOutput = z.infer<typeof BrainOutputSchema>;
