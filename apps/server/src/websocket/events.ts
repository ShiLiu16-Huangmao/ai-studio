// @ai-radio/server — Event emitter singleton
// ===================================================================

import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

/** 应用内事件总线（非 WebSocket，服务端内部通信用） */
export const eventBus = new EventEmitter();
eventBus.setMaxListeners(50);

// ===================================================================
// Internal Event Types
// ===================================================================

export const InternalEvents = {
  /** DJ 状态变更 */
  DJ_STATE_CHANGED: 'dj:state-changed',

  /** 播放器状态变更 */
  PLAYER_STATE_CHANGED: 'player:state-changed',

  /** AI 开始思考 */
  AI_THINKING_START: 'ai:thinking-start',

  /** AI 思考完毕 */
  AI_THINKING_END: 'ai:thinking-end',

  /** AI 开始说话（TTS 开始） */
  AI_SPEAKING_START: 'ai:speaking-start',

  /** AI 说话完毕（TTS 结束） */
  AI_SPEAKING_END: 'ai:speaking-end',

  /** 音乐开始播放 */
  MUSIC_PLAYING_START: 'music:playing-start',

  /** 音乐停止 */
  MUSIC_PLAYING_STOP: 'music:playing-stop',

  /** Mock 天气更新 */
  WEATHER_UPDATED: 'weather:updated',
} as const;

export type InternalEvent = (typeof InternalEvents)[keyof typeof InternalEvents];

// ===================================================================
// Debug: log all emitted events
// ===================================================================

if (process.env.NODE_ENV === 'development') {
  for (const event of Object.values(InternalEvents)) {
    eventBus.on(event, (payload: unknown) => {
      logger.debug({ event, payload }, `[EventBus] ${event}`);
    });
  }
}
