// @ai-radio/prompts — Memory context injection
// ===================================================================

import type { PromptModule } from '../types';

/**
 * Memory module — injects recalled user memories into the prompt.
 *
 * Only activates when relevant memories are available.
 */
export const memoryModule: PromptModule = {
  name: 'memory',
  priority: 35,

  render(ctx) {
    const { memories, recentTopics } = ctx;

    if (memories.length === 0 && recentTopics.length === 0) return null;

    const lines: string[] = ['## 用户记忆'];

    // Recent topics
    if (recentTopics.length > 0) {
      lines.push('');
      lines.push('### 近期关注话题');
      for (const topic of recentTopics) {
        lines.push(`- ${topic}`);
      }
    }

    // Memories
    if (memories.length > 0) {
      lines.push('');
      lines.push('### 关于用户的记忆');
      lines.push('以下是关于这位听众的一些记忆。请在对话中**自然地**参考，不要生硬地复述。只有在相关时才提及：');
      lines.push('');

      for (const mem of memories.slice(0, 5)) {
        const date = mem.createdAt.slice(0, 10);
        const typeLabel = memoryTypeLabel(mem.type);
        lines.push(`- (${date}) [${typeLabel}] ${mem.content}`);
      }

      lines.push('');
      lines.push('> 重要: 如果用户纠正了某个记忆，以用户的说法为准。忘记被纠正的记忆。');
    }

    return lines.join('\n');
  },
};

// ===================================================================
// Helpers
// ===================================================================

function memoryTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    fact: '事实',
    preference: '偏好',
    event: '事件',
    emotion: '情绪',
    relationship: '关系',
  };
  return labels[type] ?? type;
}
