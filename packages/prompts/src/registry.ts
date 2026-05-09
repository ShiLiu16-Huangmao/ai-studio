// @ai-radio/prompts — Module registry
// ===================================================================

import type { PromptModule } from './types';

const registry = new Map<string, PromptModule>();

/** Register a prompt module */
export function registerModule(mod: PromptModule): void {
  if (registry.has(mod.name)) {
    throw new Error(`Prompt module "${mod.name}" already registered`);
  }
  registry.set(mod.name, mod);
}

/** Get a registered module by name */
export function getModule(name: string): PromptModule | undefined {
  return registry.get(name);
}

/** List all registered module names, sorted by priority */
export function listModules(): PromptModule[] {
  return Array.from(registry.values()).sort((a, b) => a.priority - b.priority);
}

/** Unregister a module */
export function unregisterModule(name: string): void {
  registry.delete(name);
}

/** Check if a module is registered */
export function hasModule(name: string): boolean {
  return registry.has(name);
}

/** Clear all registered modules */
export function clearRegistry(): void {
  registry.clear();
}
