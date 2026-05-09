// @ai-radio/prompts — Module exports + auto-registration
// ===================================================================

export { systemModule } from './system';
export { djPersonaModule } from './dj-persona';
export { moodModule } from './mood';
export { transitionModule } from './transition';
export { weatherModule } from './weather';
export { memoryModule } from './memory';

import { registerModule } from '../registry';
import { systemModule } from './system';
import { djPersonaModule } from './dj-persona';
import { moodModule } from './mood';
import { transitionModule } from './transition';
import { weatherModule } from './weather';
import { memoryModule } from './memory';

/** All built-in modules in priority order */
export const ALL_MODULES = [
  systemModule,
  djPersonaModule,
  moodModule,
  transitionModule,
  weatherModule,
  memoryModule,
] as const;

/**
 * Register all built-in modules.
 * Called once at app startup.
 */
export function registerAllModules(): void {
  for (const mod of ALL_MODULES) {
    registerModule(mod);
  }
}
