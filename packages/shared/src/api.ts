// @ai-radio/shared — REST API request/response schemas

import { z } from 'zod';

// ==================== Generic API Response Wrappers ====================

export const ApiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const ApiListSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(dataSchema),
    total: z.number().int().min(0),
    hasMore: z.boolean(),
  });

// ==================== Pagination ====================
export const PaginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

// ==================== Player ====================
export const PlayerStateSchema = z.object({
  currentTrack: z
    .object({
      id: z.string(),
      name: z.string(),
      artist: z.string(),
      album: z.string(),
      coverUrl: z.string().url(),
      mp3Url: z.string().url(),
      duration: z.number().positive(),
      source: z.enum(['netease', 'local']),
    })
    .nullable(),
  queue: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      artist: z.string(),
      mp3Url: z.string().url(),
      duration: z.number().positive(),
    }),
  ),
  isPlaying: z.boolean(),
  volume: z.number().min(0).max(1),
  progress: z.number().min(0).max(100),
  duration: z.number().min(0),
  isBuffering: z.boolean(),
});
export type PlayerState = z.infer<typeof PlayerStateSchema>;

// ==================== Health ====================
export const HealthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded', 'down']),
  uptime: z.number(),
  version: z.string(),
  services: z.object({
    claude: z.boolean(),
    fishAudio: z.boolean(),
    netease: z.boolean(),
  }),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// ==================== System Stats ====================
export const SystemStatsSchema = z.object({
  totalConversations: z.number().int().min(0),
  totalMessages: z.number().int().min(0),
  totalMemories: z.number().int().min(0),
  totalTracksPlayed: z.number().int().min(0),
});
export type SystemStats = z.infer<typeof SystemStatsSchema>;

// ==================== AI Output (Claude structured output) ====================
export const ClaudeActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('recommend_music'),
    params: z.object({
      mood: z.string().optional(),
      genre: z.string().optional(),
      query: z.string().optional(),
    }),
  }),
  z.object({
    action: z.literal('play_music'),
    params: z.object({
      trackId: z.string(),
    }),
  }),
  z.object({
    action: z.literal('broadcast_weather'),
    params: z.object({}),
  }),
  z.object({
    action: z.literal('broadcast_schedule'),
    params: z.object({}),
  }),
  z.object({
    action: z.literal('none'),
    params: z.object({}),
  }),
]);
export type ClaudeAction = z.infer<typeof ClaudeActionSchema>;

export const ClaudeResponseSchema = z.object({
  text: z.string(),
  action: ClaudeActionSchema.optional(),
  mood: z
    .object({
      valence: z.number().min(-1).max(1),
      energy: z.number().min(-1).max(1),
    })
    .optional(),
});
export type ClaudeResponse = z.infer<typeof ClaudeResponseSchema>;
