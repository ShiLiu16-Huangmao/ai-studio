// @ai-radio/brain — Prompt template registry
// ===================================================================

/**
 * Named prompt templates that can be composed into the system prompt.
 *
 * Each template is a function that takes context and returns a prompt block string.
 */
export interface PromptTemplate {
  name: string;
  render: (ctx: Record<string, unknown>) => string;
}

const registry = new Map<string, PromptTemplate>();

export function registerTemplate(template: PromptTemplate): void {
  registry.set(template.name, template);
}

export function getTemplate(name: string): PromptTemplate | undefined {
  return registry.get(name);
}

export function listTemplates(): string[] {
  return Array.from(registry.keys());
}

// ===================================================================
// Built-in templates
// ===================================================================

registerTemplate({
  name: 'chat-rules',
  render: () => `## 对话规则
- 回复长度：2~5 句，像聊天不是写文章
- 可以主动推荐音乐，但要自然不突兀
- 如果用户情绪低落，语气更温柔
- 适时留白，不需要一直说话
- 用户纠正你时，立即接受并更新记忆`,
});

registerTemplate({
  name: 'output-format',
  render: () => `## 输出格式
你必须返回严格 JSON，格式如下：
{
  "text": "你的完整回复文本",
  "segments": [
    { "text": "段落1文本", "type": "greeting" },
    { "text": "段落2文本", "type": "comment" }
  ],
  "mood_valence": -0.5~1.0,
  "mood_energy": -0.5~1.0,
  "mood_label": "chill|energetic|melancholy|cheerful|neutral",
  "mood_reason": "简短解释 mood 变化原因",
  "energy": 0.0~1.0,
  "recommend_song": "曲名（无可省略此字段）",
  "recommend_artist": "歌手（无可省略）",
  "recommend_reason": "推荐理由（无可省略）",
  "transition": "greeting|reply|weather_intro|music_intro|farewell|idle"
}

segment type 可选值: greeting, observation, memory_ref, question, music_recommend, weather_report, schedule_remind, sign_off, comment

只返回 JSON，不要多余文字。`,
});

registerTemplate({
  name: 'music-rules',
  render: () => `## 音乐推荐规则
- 根据情绪推荐: chill→爵士/Lofi, melancholy→蓝调/后摇, cheerful→CityPop/Funk
- 参考用户偏好，避开最近播放过的
- 推荐时附带简短推荐理由
- 如果没有合适的歌，不强行推荐`,
});
