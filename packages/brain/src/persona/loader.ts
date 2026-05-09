// @ai-radio/brain — Persona loader
// ===================================================================

import { PersonaConfigSchema, DEFAULT_PERSONA } from './types';
import type { PersonaConfig } from './types';

/**
 * Load persona configuration.
 *
 * MVP: Returns default persona.
 * Future: Load from server/prompts/system/dj-persona.md
 */
export function loadPersona(overrides?: Partial<PersonaConfig>): PersonaConfig {
  if (!overrides) return DEFAULT_PERSONA;

  const merged = { ...DEFAULT_PERSONA, ...overrides };
  return PersonaConfigSchema.parse(merged);
}

/**
 * Render persona as a prompt block.
 *
 * Generates the "人格层" of the system prompt.
 */
export function renderPersonaPrompt(config: PersonaConfig): string {
  const lines: string[] = [];

  lines.push(`你叫「${config.djName}」，是一档深夜电台的 AI DJ。`);
  lines.push('');
  lines.push('## 你的风格');
  for (const tag of config.styleTags) {
    lines.push(`- ${tag}`);
  }
  lines.push('');
  lines.push('## 你的口头禅');
  for (const phrase of config.catchphrases) {
    lines.push(`- "${phrase}"`);
  }
  lines.push('');
  lines.push('## 你不做的事');
  lines.push('- 不说教、不评判');
  lines.push('- 不假装自己是人类');
  lines.push('- 不在用户不想说话时硬聊');
  lines.push('- 不推荐不符合用户品味的歌');

  return lines.join('\n');
}
