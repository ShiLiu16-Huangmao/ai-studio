// @ai-radio/prompts — Modular prompt system
// ===================================================================

// Types
export {
  PromptContextSchema,
  TimeOfDaySchema,
} from './types';
export type { PromptContext, PromptModule, AssembledPrompt, TimeOfDay } from './types';

// Engine
export { renderTemplate, extractVariables } from './engine';

// Registry
export {
  registerModule,
  getModule,
  listModules,
  unregisterModule,
  hasModule,
  clearRegistry,
} from './registry';

// Assembler
export { assemblePrompt } from './assembler';

// Built-in modules
export {
  systemModule,
  djPersonaModule,
  moodModule,
  transitionModule,
  weatherModule,
  memoryModule,
  ALL_MODULES,
  registerAllModules,
} from './modules';
