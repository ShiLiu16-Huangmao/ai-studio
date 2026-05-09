// @ai-radio/prompts — Transition/scene context module
// ===================================================================

import type { PromptModule } from '../types';

/**
 * Transition module — provides context about the conversation flow.
 *
 * Detects whether this is:
 * - A new conversation (greeting needed)
 * - Continuing a topic
 * - Topic change
 * - Coming back after a pause
 */
export const transitionModule: PromptModule = {
  name: 'transition',
  priority: 25,

  render(ctx) {
    const history = ctx.conversationHistory;

    // Brand new conversation
    if (history.length === 0) {
      return `## 对话阶段

这是今晚的第一次对话。
- 以自然的方式问候用户
- 可以提及时段和天气，但不要生硬地罗列
- 观察用户状态，不要过度热情`;
    }

    // Short conversation (< 5 exchanges)
    if (history.length <= 4) {
      return `## 对话阶段

你正在与用户进行一段简短的对话（${history.length} 轮）。
- 保持自然流畅
- 如果用户主动提问，直接回答
- 如果对话自然结束，可以推荐一首歌`;
    }

    // Long conversation (5+ exchanges) — topic tracking
    const recent = history.slice(-6);
    const userMessages = recent
      .filter((m) => m.role === 'user')
      .map((m) => m.content);

    return `## 对话阶段

你正在进行一段持续的对话（${history.length} 轮）。

### 最近用户消息
${userMessages.map((m, i) => `${i + 1}. ${m}`).join('\n')}

- 注意不要重复之前说过的话
- 如果用户切换了话题，自然地跟上
- 如果对话进入自然的沉默，可以推荐一首合适的歌`;
  },
};
