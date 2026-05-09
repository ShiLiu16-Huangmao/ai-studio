// @ai-radio/brain — Mock Claude adapter for development
// ===================================================================

import type { IClaudeAdapter, ClaudeOptions, ClaudeResponse } from './adapter';

/**
 * Pre-built mock responses for MVP development.
 *
 * Simulates Claude's structured JSON output without making real API calls.
 */
const MOCK_RESPONSES = [
  {
    trigger: '心情不好',
    response: {
      text: '听上去你今天有些低落。没关系，夜晚就是用来安放情绪的。让我放一首温柔的爵士，陪你把不开心慢慢散掉。',
      segments: [
        { text: '听上去你今天有些低落。没关系，夜晚就是用来安放情绪的。', type: 'observation' },
        { text: '让我放一首温柔的爵士，陪你把不开心慢慢散掉。', type: 'music_recommend' },
      ],
      mood_valence: -0.3,
      mood_energy: -0.3,
      mood_label: 'melancholy',
      mood_reason: '用户表达了低落情绪',
      energy: 0.3,
      recommend_song: 'Misty',
      recommend_artist: 'Erroll Garner',
      recommend_reason: '经典爵士钢琴曲，像夜雾般温柔，适合安放情绪',
      recommend_genre: 'jazz',
      recommend_mood: 'melancholy',
      transition: 'music_intro',
    },
  },
  {
    trigger: '开心',
    response: {
      text: '看样子心情不错！那就来点活力的节奏，让今晚更精彩。这首 City Pop 送给你，愿你一直这么明亮。',
      segments: [
        { text: '看样子心情不错！那就来点活力的节奏，让今晚更精彩。', type: 'observation' },
        { text: '这首 City Pop 送给你，愿你一直这么明亮。', type: 'music_recommend' },
      ],
      mood_valence: 0.5,
      mood_energy: 0.4,
      mood_label: 'cheerful',
      mood_reason: '用户表达了积极情绪',
      energy: 0.7,
      recommend_song: 'Plastic Love',
      recommend_artist: '竹内まりや',
      recommend_reason: '经典 City Pop，活力与浪漫并存的节奏',
      recommend_genre: 'citypop',
      recommend_mood: 'cheerful',
      transition: 'music_intro',
    },
  },
  {
    trigger: '天气',
    response: {
      text: '是啊，今晚外面有点凉。18度的微风，适合窝在房间里，泡杯热茶，听点温暖的声音。',
      segments: [
        { text: '是啊，今晚外面有点凉。', type: 'observation' },
        { text: '18度的微风，适合窝在房间里，泡杯热茶，听点温暖的声音。', type: 'weather_report' },
      ],
      mood_valence: 0.1,
      mood_energy: -0.1,
      mood_label: 'chill',
      mood_reason: '天气话题，中性偏放松',
      energy: 0.4,
      transition: 'weather_intro',
    },
  },
  {
    trigger: 'default',
    response: {
      text: '今晚的月色真美。很适合听一首安静的爵士，让音乐陪你度过这个夜晚。说起来，我最近发现了一首很好听的曲子...',
      segments: [
        { text: '今晚的月色真美。很适合听一首安静的爵士，让音乐陪你度过这个夜晚。', type: 'greeting' },
        { text: '说起来，我最近发现了一首很好听的曲子...', type: 'observation' },
      ],
      mood_valence: 0.2,
      mood_energy: -0.1,
      mood_label: 'chill',
      mood_reason: '安静夜晚，放松状态',
      energy: 0.4,
      recommend_song: 'Fly Me to the Moon',
      recommend_artist: 'Frank Sinatra',
      recommend_reason: '月夜经典，送给还没睡的你',
      recommend_genre: 'jazz',
      recommend_mood: 'chill',
      transition: 'greeting',
    },
  },
] as const;

export class MockClaudeAdapter implements IClaudeAdapter {
  private latencyMs: number;

  constructor(latencyMs = 200) {
    this.latencyMs = latencyMs;
  }

  async chat(
    _systemPrompt: string,
    userMessage: string,
    _options?: ClaudeOptions,
  ): Promise<ClaudeResponse> {
    // Simulate network latency
    await delay(this.latencyMs);

    // Match intent
    const lower = userMessage.toLowerCase();
    let match = MOCK_RESPONSES.find((m) =>
      lower.includes(m.trigger),
    );

    if (!match) {
      match = MOCK_RESPONSES[MOCK_RESPONSES.length - 1]!;
    }

    const content = JSON.stringify(match.response);

    return {
      content,
      usage: {
        inputTokens: 400,
        outputTokens: 120,
      },
      cacheHit: false,
      latencyMs: this.latencyMs,
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
