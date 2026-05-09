// @ai-radio/server — DJ state service
// ===================================================================

import type { MoodType, AIState } from '@ai-radio/shared';
import { logger } from '../utils/logger';
import { eventBus, InternalEvents } from '../websocket/events';

/**
 * DJ 状态管理
 *
 * 维护 DJ 的当前状态，包括:
 * - thinking 阶段
 * - mood 情绪
 * - 当前环节描述
 */
export class DJService {
  private state: AIState;

  constructor() {
    this.state = {
      thinking: 'idle',
      mood: 'neutral',
      valence: 0,
      energy: 0,
      confidence: 1.0,
      updatedAt: new Date().toISOString(),
    };
  }

  /** Get current DJ state snapshot */
  getState(): AIState {
    return { ...this.state };
  }

  /** Set thinking state */
  setThinking(phase: AIState['thinking']): void {
    this.state = { ...this.state, thinking: phase, updatedAt: new Date().toISOString() };

    if (phase !== 'idle') {
      eventBus.emit(InternalEvents.DJ_STATE_CHANGED, {
        status: 'broadcasting',
        thinking: phase,
        mood: this.state.mood,
      });
    }

    logger.debug({ thinking: phase }, 'DJ thinking state updated');
  }

  /** Update DJ mood based on conversation analysis */
  updateMood(mood: MoodType, valence: number, energy: number): void {
    this.state = {
      ...this.state,
      mood,
      valence: this.clamp(valence, -1, 1),
      energy: this.clamp(energy, -1, 1),
      updatedAt: new Date().toISOString(),
    };

    eventBus.emit(InternalEvents.DJ_STATE_CHANGED, {
      status: 'online',
      mood,
      thinking: this.state.thinking,
    });

    logger.info({ mood, valence, energy }, 'DJ mood updated');
  }

  /** Get DJ status string for broadcast */
  getStatus(): 'online' | 'broadcasting' | 'resting' {
    if (this.state.thinking !== 'idle') return 'broadcasting';
    return 'online';
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}

export const djService = new DJService();
