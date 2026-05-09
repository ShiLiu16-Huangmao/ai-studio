// @ai-radio/brain — DJ Brain: the decision engine
// ===================================================================
// Brain 是纯粹的决策层。
// 不操作 WebSocket · 不播放音频 · 不访问 UI
// 只负责：分析输入 → 调用 Claude → 输出决策
// ===================================================================

import type { IClaudeAdapter, ClaudeOptions } from './claude/adapter';
import type { PersonaConfig } from './persona';
import { loadPersona } from './persona';
import { assembleSystemPrompt } from './prompt/assembler';
import { MoodEngine } from './mood/engine';
import { parseBrainOutput } from './validation/brainOutput';
import { BrainInputSchema, BrainOutputSchema } from './types';
import type { BrainOutput } from './types';

// ===================================================================
// Brain Config
// ===================================================================

export interface BrainOptions {
  /** Persona overrides */
  persona?: Partial<PersonaConfig>;

  /** Claude API options */
  claude?: ClaudeOptions;

  /** Max tokens for Claude output */
  maxTokens?: number;
}

// ===================================================================
// Brain Class
// ===================================================================

export class Brain {
  private claude: IClaudeAdapter;
  private persona: PersonaConfig;
  private moodEngine: MoodEngine;
  private claudeOptions: ClaudeOptions;

  constructor(claude: IClaudeAdapter, options: BrainOptions = {}) {
    this.claude = claude;
    this.persona = loadPersona(options.persona);
    this.moodEngine = new MoodEngine();
    this.claudeOptions = {
      maxTokens: options.maxTokens ?? 500,
      temperature: options.claude?.temperature ?? 0.8,
      ...options.claude,
    };
  }

  /**
   * Main decision pipeline.
   *
   * 1. Validate input (zod)
   * 2. Assemble system prompt from modules
   * 3. Call Claude API (via adapter)
   * 4. Parse + validate output (zod)
   * 5. Apply mood continuity
   * 6. Return structured BrainOutput
   */
  async decide(rawInput: unknown): Promise<BrainOutput> {
    // 1. Validate input
    const input = BrainInputSchema.parse(rawInput);

    // 2. Assemble system prompt
    const systemPrompt = assembleSystemPrompt(this.persona, input);

    // 3. Call Claude
    const startTime = Date.now();
    const response = await this.claude.chat(
      systemPrompt,
      input.userMessage,
      this.claudeOptions,
    );
    const latencyMs = Date.now() - startTime;

    // 4. Parse + validate output
    const output = parseBrainOutput(response.content);

    // 5. Apply mood continuity
    const updatedMood = this.moodEngine.apply(output.mood);

    // 6. Build final output with metadata
    const final = BrainOutputSchema.parse({
      ...output,
      mood: {
        valence: updatedMood.valence,
        energy: updatedMood.energy,
        label: updatedMood.label,
        reason: output.mood.reason,
      },
      metadata: {
        tokensUsed: response.usage.outputTokens,
        latencyMs,
      },
    });

    return final;
  }

  /**
   * Get current mood (for external queries).
   * Brain 不主动推送 mood — 由 server 层轮询或事件驱动
   */
  getCurrentMood() {
    return this.moodEngine.current;
  }

  /**
   * Apply natural mood decay.
   * Called periodically by server scheduler.
   */
  decayMood() {
    return this.moodEngine.decay();
  }

  /**
   * Reset mood to default.
   */
  resetMood() {
    this.moodEngine.reset();
  }

  /**
   * Update persona at runtime.
   */
  updatePersona(overrides: Partial<PersonaConfig>) {
    this.persona = loadPersona({ ...this.persona, ...overrides });
  }

  /**
   * Get current persona config.
   */
  getPersona(): PersonaConfig {
    return { ...this.persona };
  }
}
