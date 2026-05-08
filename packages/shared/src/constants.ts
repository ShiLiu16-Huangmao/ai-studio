// @ai-radio/shared — Application-wide constants

export const APP_NAME = 'AI Radio';

export const DEFAULT_DJ_NAME = '夜汐';

export const DEFAULT_TIMEZONE = 'Asia/Shanghai';

export const PORTS = {
  CLIENT: 5173,
  SERVER: 3001,
} as const;

export const WS_PATH = '/ws';

export const AUDIO_FORMAT = {
  FORMAT: 'mp3' as const,
  BITRATE: 128_000,
  SAMPLE_RATE: 44_100,
  TTS_CHANNELS: 1,
  MUSIC_CHANNELS: 2,
} as const;

export const DUCKING = {
  DUCKED_VOLUME: 0.2,
  FADE_DURATION_MS: 300,
} as const;

export const STREAMING = {
  MIN_SENTENCE_LENGTH: 2,
  MAX_SENTENCE_LENGTH: 80,
  SENTENCE_BOUNDARY: /[.。!！?？,，;；\n]/,
} as const;

export const MEMORY = {
  MAX_INJECTED_MEMORIES: 5,
  DECAY_THRESHOLD: 0.1,
} as const;

export const SYSTEM_PROMPT = {
  MAX_TOKENS: 800,
  RECENT_MESSAGE_ROUNDS: 15,
} as const;

export const RECONNECT = {
  INITIAL_DELAY_MS: 1000,
  MAX_DELAY_MS: 30_000,
  BACKOFF_MULTIPLIER: 2,
} as const;

export const HEARTBEAT = {
  INTERVAL_MS: 30_000,
  TIMEOUT_MS: 60_000,
} as const;

export const RATE_LIMIT = {
  REST_GLOBAL_PER_MIN: 100,
  MUSIC_SEARCH_PER_MIN: 30,
  WEATHER_PER_MIN: 10,
  CHAT_MESSAGE_PER_MIN: 20,
} as const;
