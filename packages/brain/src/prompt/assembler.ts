// @ai-radio/brain — System prompt assembler
// ===================================================================

import type { PersonaConfig } from '../persona';
import { renderPersonaPrompt } from '../persona';
import { getTemplate } from './templates';
import type { BrainInput } from '../types';

/**
 * Assemble the complete system prompt for one turn.
 *
 * Structure:
 *   Layer 1: DJ Persona (人格层)
 *   Layer 2: Chat Rules (规则层)
 *   Layer 3: Dynamic Context (上下文层 — time, weather, mood, memories)
 *   Layer 4: Music Rules + Output Format (指令层)
 */
export function assembleSystemPrompt(
  persona: PersonaConfig,
  input: BrainInput,
): string {
  const blocks: string[] = [];

  // Layer 1: Persona
  blocks.push(renderPersonaPrompt(persona));

  // Layer 2: Rules
  const rules = getTemplate('chat-rules');
  if (rules) blocks.push(rules.render({}));

  // Layer 3: Dynamic context
  blocks.push(buildContextBlock(input));

  // Layer 4: Music rules + Output format
  const musicRules = getTemplate('music-rules');
  if (musicRules) blocks.push(musicRules.render({}));

  const outputFormat = getTemplate('output-format');
  if (outputFormat) blocks.push(outputFormat.render({}));

  return blocks.join('\n\n---\n\n');
}

/**
 * Build the 「当前上下文」 block from dynamic data.
 */
function buildContextBlock(input: BrainInput): string {
  const lines: string[] = ['## 当前上下文'];

  // Time
  lines.push(`- 时间: ${input.currentTime.timeOfDay} ${input.currentTime.dayOfWeek}`);

  // Weather
  if (input.weather) {
    lines.push(
      `- 天气: ${input.weather.city} ${input.weather.temperature}°C ${input.weather.condition}`,
    );
  }

  // Mood
  lines.push(
    `- 用户当前情绪: ${input.currentMood.label} (valence=${input.currentMood.valence}, energy=${input.currentMood.energy})`,
  );

  // Recent memories
  if (input.recentContext.memories.length > 0) {
    lines.push('- 近期记忆:');
    for (const mem of input.recentContext.memories.slice(0, 5)) {
      lines.push(`  - (${mem.createdAt.slice(0, 10)}) [${mem.type}] ${mem.content}`);
    }
  }

  // Recent topics
  if (input.recentContext.recentTopics.length > 0) {
    lines.push(`- 近期话题: ${input.recentContext.recentTopics.join('、')}`);
  }

  // Mood history trend
  if (input.recentContext.moodHistory.length > 0) {
    const recentMoods = input.recentContext.moodHistory.slice(-5);
    const trend = recentMoods.map((m: { mood: string }) => m.mood).join(' → ');
    lines.push(`- 近期情绪趋势: ${trend}`);
  }

  return lines.join('\n');
}
