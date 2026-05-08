// @ai-radio/prompts — Prompt template types

export interface PromptTemplate {
  name: string;
  path: string; // Relative to prompts/ directory
  content: string;
  variables: string[]; // Extracted {{variable}} names
}

export interface PromptContext {
  /** Current date/time formatting */
  timeContext?: {
    now: string;
    timeOfDay: string; // "深夜" | "清晨" | "上午" | "下午" | "傍晚"
    dayOfWeek: string;
  };

  /** Weather snapshot injected into prompt */
  weather?: Record<string, unknown>;

  /** Upcoming schedule items */
  schedule?: Record<string, unknown>[];

  /** Relevant memory entries */
  memories?: Array<{
    content: string;
    type: string;
    createdAt: string;
  }>;

  /** User's current emotional state */
  userMood?: string;

  /** DJ persona customization */
  djName?: string;
}

export interface RenderedPrompt {
  systemPrompt: string;
  dynamicContext: string;
}
