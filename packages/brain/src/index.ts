// @ai-radio/brain — DJ Brain: persona + context + mood + decision
// ===================================================================

// Core
export { Brain } from './brain';
export type { BrainOptions } from './brain';

// Types
export {
  BrainInputSchema,
  BrainOutputSchema,
  TimeContextSchema,
  WeatherContextSchema,
  RecentContextSchema,
  CurrentMoodSchema,
  SaySegmentSchema,
  MusicRecommendationSchema,
  MoodDecisionSchema,
  TransitionTypeSchema,
} from './types';
export type {
  BrainInput,
  BrainOutput,
  TimeContext,
  WeatherContext,
  RecentContext,
  CurrentMood,
  SaySegment,
  MusicRecommendation,
  MoodDecision,
  TransitionType,
} from './types';

// Persona
export {
  PersonaConfigSchema,
  DEFAULT_PERSONA,
  loadPersona,
  renderPersonaPrompt,
} from './persona';
export type { PersonaConfig } from './persona';

// Prompt
export { assembleSystemPrompt } from './prompt/assembler';
export { registerTemplate, getTemplate, listTemplates } from './prompt/templates';
export type { PromptTemplate } from './prompt/templates';

// Mood
export { MoodEngine } from './mood/engine';
export { MoodStateSchema, DEFAULT_MOOD } from './mood/types';
export type { MoodState } from './mood/types';

// Claude
export type { IClaudeAdapter, ClaudeOptions, ClaudeResponse } from './claude/adapter';
export { MockClaudeAdapter } from './claude/mock';

// Validation
export { parseBrainOutput } from './validation/brainOutput';
