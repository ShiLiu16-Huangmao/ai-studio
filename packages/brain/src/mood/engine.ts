// @ai-radio/brain — Mood continuity engine
// ===================================================================

import type { MoodState } from './types';
import { DEFAULT_MOOD } from './types';
import type { MoodDecision } from '../types';

/**
 * Mood continuity engine.
 *
 * Enforces:
 * - Max change per turn: 0.3 (valence) / 0.3 (energy)
 * - Gradual regression toward neutral (×0.95 per turn when not directly affected)
 * - Label derived from valence + energy quadrant
 */
export class MoodEngine {
  private state: MoodState;

  constructor(initial?: Partial<MoodState>) {
    this.state = { ...DEFAULT_MOOD, ...initial, updatedAt: new Date().toISOString() };
  }

  /** Get current mood snapshot */
  get current(): MoodState {
    return { ...this.state };
  }

  /**
   * Apply a mood decision from Brain output.
   *
   * The decision is constrained:
   * 1. Delta clamped to [-0.3, +0.3]
   * 2. Valence/energy clamped to [-1, 1]
   * 3. Label re-derived from values
   */
  apply(decision: MoodDecision): MoodState {
    // Clamp delta
    const targetValence = clamp(
      decision.valence,
      this.state.valence - 0.3,
      this.state.valence + 0.3,
    );
    const targetEnergy = clamp(
      decision.energy,
      this.state.energy - 0.3,
      this.state.energy + 0.3,
    );

    // Apply with some smoothing (weighted toward target)
    const newValence = clamp(
      this.state.valence * 0.3 + targetValence * 0.7,
      -1,
      1,
    );
    const newEnergy = clamp(
      this.state.energy * 0.3 + targetEnergy * 0.7,
      -1,
      1,
    );

    const newLabel = this.valenceEnergyToLabel(newValence, newEnergy);

    this.state = {
      valence: round(newValence),
      energy: round(newEnergy),
      label: newLabel,
      confidence: 0.7,
      updatedAt: new Date().toISOString(),
    };

    return { ...this.state };
  }

  /**
   * Apply natural decay (called on idle/timer).
   * Gradual regression toward neutral.
   */
  decay(): MoodState {
    const newValence = clamp(this.state.valence * 0.95, -1, 1);
    const newEnergy = clamp(this.state.energy * 0.95, -1, 1);
    const newLabel = this.valenceEnergyToLabel(newValence, newEnergy);

    this.state = {
      valence: round(newValence),
      energy: round(newEnergy),
      label: newLabel,
      confidence: this.state.confidence * 0.95,
      updatedAt: new Date().toISOString(),
    };

    return { ...this.state };
  }

  /** Reset to default */
  reset(): void {
    this.state = { ...DEFAULT_MOOD, updatedAt: new Date().toISOString() };
  }

  // ==================== Private ====================

  private valenceEnergyToLabel(
    v: number,
    e: number,
  ): 'chill' | 'energetic' | 'melancholy' | 'cheerful' | 'neutral' {
    if (v >= 0.3 && e >= 0.3) return 'cheerful';
    if (v >= 0.3 && e < 0.3) return 'chill';
    if (v < -0.2 && e < 0) return 'melancholy';
    if (e >= 0.5) return 'energetic';
    return 'neutral';
  }
}

// ===================================================================
// Helpers
// ===================================================================

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
