// @ai-radio/server — Pino logger instance
// ===================================================================

import pino from 'pino';
import { env } from './env';

export const logger = pino({
  level: env.RADIO_LOG_LEVEL,
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

export type Logger = typeof logger;
