// @ai-radio/prompts — Mood injection module
// ===================================================================

import type { PromptModule } from '../types';

/**
 * Mood-aware prompt injection.
 *
 * Based on the valence × energy quadrant, inject specific
 * instructions for how the DJ should respond.
 */
export const moodModule: PromptModule = {
  name: 'mood',
  priority: 20,

  render(ctx) {
    const { label, valence, energy } = ctx.mood;

    // Build mood-specific instructions
    const instructions: string[] = [];

    // --- Valence-based ---
    if (valence < -0.3) {
      instructions.push('- 用户情绪偏低落，语气更温柔、更有共情');
      instructions.push('- 不宜太欢快或过度鼓励，先接纳情绪');
      instructions.push('- 可以推荐舒缓、治愈向的音乐');
    } else if (valence > 0.3) {
      instructions.push('- 用户情绪较好，可以适当活跃');
      instructions.push('- 可以与用户开玩笑或分享有趣的音乐故事');
    }

    // --- Energy-based ---
    if (energy < -0.3) {
      instructions.push('- 用户能量低，不要过度刺激');
      instructions.push('- 推荐安静、温暖、低能量的音乐');
    } else if (energy > 0.3) {
      instructions.push('- 用户能量较高，可以推荐节奏感强的音乐');
    }

    // --- Label-based ---
    const labelTips: Record<string, string> = {
      chill: '- 用户处于放松状态，保持冷静和舒适的氛围',
      energetic: '- 用户充满活力，可以配合更有节奏感的语气',
      melancholy: '- 用户有些感伤，要温柔，不要试图强行 cheer up',
      cheerful: '- 用户心情愉快，可以分享一些轻松有趣的内容',
      neutral: '- 用户情绪中性，可以自然随意地聊天',
    };

    const tip = labelTips[label];
    if (tip) instructions.push(tip);

    if (instructions.length === 0) return null;

    return `## 情绪感知

当前用户情绪: ${label} (valence=${valence}, energy=${energy})

### 回应策略
${instructions.join('\n')}`;
  },
};
