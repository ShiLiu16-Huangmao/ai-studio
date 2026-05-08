// @ai-radio/shared — Unified exports

// ==================== Schemas (runtime validation + types) ====================
export * from './schemas';

// ==================== Event name constants ====================
export { ClientEvents, ServerEvents, ALL_EVENTS } from './events';
export type { ClientEventType, ServerEventType } from './events';

// ==================== Application constants ====================
export {
  APP_NAME,
  DEFAULT_DJ_NAME,
  DEFAULT_TIMEZONE,
  PORTS,
  WS_PATH,
  AUDIO_FORMAT,
  DUCKING,
  STREAMING,
  MEMORY,
  SYSTEM_PROMPT,
  RECONNECT,
  HEARTBEAT,
  RATE_LIMIT,
} from './constants';

// ==================== API types ====================
export {
  ApiSuccessSchema,
  ApiErrorSchema,
  ApiListSchema,
  PaginationQuerySchema,
  PlayerStateSchema,
  HealthResponseSchema,
  SystemStatsSchema,
  ClaudeActionSchema,
  ClaudeResponseSchema,
} from './api';
export type {
  ApiError,
  PaginationQuery,
  PlayerState,
  HealthResponse,
  SystemStats,
  ClaudeAction,
  ClaudeResponse,
} from './api';
