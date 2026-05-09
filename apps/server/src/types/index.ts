// @ai-radio/server — Server-specific types
// ===================================================================

import type { Request, Response, NextFunction } from 'express';
import type { WebSocket } from 'ws';

// ===================================================================
// Controller / Middleware
// ===================================================================

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export type Controller = Record<string, AsyncHandler>;

// ===================================================================
// WebSocket
// ===================================================================

export interface WSClient {
  id: string;
  ws: WebSocket;
  connectedAt: number;
  lastPing: number;
  seq: number;
}

// ===================================================================
// App State
// ===================================================================

export interface AppState {
  /** DJ 当前运行状态 */
  dj: {
    status: 'online' | 'broadcasting' | 'resting';
    mood: string;
    thinking: string;
    currentSegment: string | null;
  };
  /** 播放器状态 */
  player: {
    currentSong: unknown | null;
    isPlaying: boolean;
    volume: number;
    progress: number;
  };
  /** 当前天气缓存 */
  weather: unknown | null;
  /** 服务启动时间戳 */
  startedAt: number;
}

// ===================================================================
// SSE-like streaming event (via WebSocket)
// ===================================================================

export interface ServerEvent {
  type: string;
  payload: unknown;
  timestamp: number;
  seq: number;
}
