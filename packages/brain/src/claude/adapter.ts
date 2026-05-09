// @ai-radio/brain — Claude API adapter interface
// ===================================================================

/**
 * Claude API adapter interface.
 *
 * Brain depends on this abstraction — never on the real SDK directly.
 * This allows:
 * - Unit testing with mock adapter
 * - Swapping Claude for other LLMs later
 * - Rate limiting / retry in one place
 */
export interface IClaudeAdapter {
  /**
   * Send a prompt to Claude and get a structured response.
   *
   * @param systemPrompt — Full assembled system prompt
   * @param userMessage — The user's raw message text
   * @param options — Optional overrides (maxTokens, temperature, etc.)
   * @returns Raw response text (expected to be JSON)
   */
  chat(
    systemPrompt: string,
    userMessage: string,
    options?: ClaudeOptions,
  ): Promise<ClaudeResponse>;
}

export interface ClaudeOptions {
  /** Max output tokens */
  maxTokens?: number;
  /** Temperature (0~1) */
  temperature?: number;
  /** Model ID override */
  model?: string;
}

export interface ClaudeResponse {
  /** Raw response text */
  content: string;
  /** Token usage */
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  /** Was prompt cache hit */
  cacheHit: boolean;
  /** Request latency (ms) */
  latencyMs: number;
}
