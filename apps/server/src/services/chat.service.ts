// @ai-radio/server — Chat service (mock — no real Claude)
// ===================================================================

import { logger } from '../utils/logger';
import { eventBus, InternalEvents } from '../websocket/events';
import { playerService } from './player.service';

/** Pre-built mock responses for MVP demo */
const MOCK_RESPONSES = {
  default: '今晚的月色真美。很适合听一首安静的爵士，让音乐陪你度过这个夜晚。',
  music: '好的，让我为你选一首歌。这首《Fly Me to the Moon》送给你，愿月光温柔，伴你入眠。',
  weather: '今天外面的温度是 18°C，多云。微凉的夜晚，记得给自己泡杯热茶。',
  greeting: '嗨，又见面了。今晚想听点什么？无论是爵士、Lofi，还是 City Pop，我都可以为你安排。',
  mood_low: '听上去你有些低落。没关系，我在这里。让我放一首舒缓的曲子，也许能让心情好一点。',
  mood_high: '看样子心情不错！那就来点有活力的节奏，让今晚更精彩。',
} as const;

function mock(key: keyof typeof MOCK_RESPONSES): string {
  return MOCK_RESPONSES[key];
}

export class ChatService {
  /**
   * Mock chat: 分析用户输入，返回模拟回复
   *
   * 真实实现会:
   * 1. 调用 Brain 层组装 context
   * 2. 调用 Claude API 流式生成
   * 3. 触发 TTS 转换
   * 4. 通过 WS 流式推送
   */
  async handleMessage(
    text: string,
    _conversationId?: string,
  ): Promise<{
    text: string;
    action: string | null;
    track: unknown | null;
    mood: { valence: number; energy: number } | null;
  }> {
    logger.info({ text }, 'Processing chat message');

    // 1. Emit thinking state
    eventBus.emit(InternalEvents.AI_THINKING_START, {
      message: '正在理解你的话...',
    });

    // Simulate thinking delay
    await this.delay(800);

    eventBus.emit(InternalEvents.AI_THINKING_END, {});
    eventBus.emit(InternalEvents.AI_SPEAKING_START, {
      message: '准备回复...',
    });

    // 2. Simple intent detection from text
    const response = this.matchResponse(text);

    // 3. Handle music recommendation intent
    let track: unknown = null;
    if (response.action === 'recommend_music') {
      track = playerService.getMockTrack();
      eventBus.emit(InternalEvents.MUSIC_PLAYING_START, { track });
    }

    // 4. Emit speaking end
    eventBus.emit(InternalEvents.AI_SPEAKING_END, {
      text: response.text,
    });

    return {
      text: response.text,
      action: response.action,
      track,
      mood: response.mood,
    };
  }

  /** Simple keyword-based response matching */
  private matchResponse(text: string): {
    text: string;
    action: string | null;
    mood: { valence: number; energy: number } | null;
  } {
    const lower = text.toLowerCase();

    if (lower.includes('心情不好') || lower.includes('难过') || lower.includes('低落')) {
      return {
        text: mock('mood_low'),
        action: 'recommend_music',
        mood: { valence: -0.4, energy: -0.3 },
      };
    }

    if (lower.includes('开心') || lower.includes('兴奋') || lower.includes('哈哈')) {
      return {
        text: mock('mood_high'),
        action: 'recommend_music',
        mood: { valence: 0.6, energy: 0.5 },
      };
    }

    if (lower.includes('放') || lower.includes('音乐') || lower.includes('歌') || lower.includes('推荐')) {
      return {
        text: mock('music'),
        action: 'recommend_music',
        mood: null,
      };
    }

    if (lower.includes('天气') || lower.includes('温度')) {
      return {
        text: mock('weather'),
        action: 'broadcast_weather',
        mood: null,
      };
    }

    if (lower.includes('你好') || lower.includes('嗨') || lower.includes('hi') || lower.includes('今晚')) {
      return {
        text: mock('greeting'),
        action: null,
        mood: null,
      };
    }

    return { text: mock('default'), action: null, mood: null };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const chatService = new ChatService();
