// @ai-radio/prompts — Dynamic prompt assembler
// ===================================================================

import { listModules } from './registry';
import { PromptContextSchema } from './types';
import type { AssembledPrompt } from './types';
import { separator } from './engine';

/**
 * Assemble the complete system prompt from registered modules.
 *
 * Pipeline:
 * 1. Validate context (zod)
 * 2. Iterate modules in priority order
 * 3. Render each → collect blocks (skip null)
 * 4. Join with separators
 * 5. Return AssembledPrompt with metadata
 */
export function assemblePrompt(
  rawContext: unknown,
  options?: {
    /** Only include these modules (filter by name) */
    only?: string[];
    /** Exclude these modules */
    exclude?: string[];
  },
): AssembledPrompt {
  // 1. Validate context
  const ctx = PromptContextSchema.parse(rawContext);

  // 2. Get sorted modules
  let modules = listModules();

  // Apply filters
  if (options?.only) {
    const nameSet = new Set(options.only);
    modules = modules.filter((m) => nameSet.has(m.name));
  }
  if (options?.exclude) {
    const excludeSet = new Set(options.exclude);
    modules = modules.filter((m) => !excludeSet.has(m.name));
  }

  // 3. Render each module
  const blocks: Array<{ module: string; content: string }> = [];
  const activeModules: string[] = [];
  const skippedModules: string[] = [];

  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i]!;
    const content = mod.render(ctx);

    if (content === null || content.trim().length === 0) {
      skippedModules.push(mod.name);
      continue;
    }

    blocks.push({ module: mod.name, content });
    activeModules.push(mod.name);
  }

  // 4. Join with separators
  const parts = blocks.map((b, i) => {
    const sep = separator(i, blocks.length);
    return sep + b.content;
  });

  const systemPrompt = parts.join('');

  // 5. Return
  return {
    systemPrompt,
    blocks,
    meta: {
      activeModules,
      skippedModules,
      promptLength: systemPrompt.length,
    },
  };
}
