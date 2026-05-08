// @ai-radio/brain — DJ Brain: central orchestration for chat, persona, memory, music

import type { MoodState, WeatherData, ScheduleItem, MemoryEntry } from '@ai-radio/shared';
import type { BrainConfig, AssembledContext } from './types';
import type { PromptEngine } from '@ai-radio/prompts';
import type { MemoryRetriever } from '@ai-radio/memory';

export interface BrainDependencies {
  promptEngine: PromptEngine;
  memoryRetriever: MemoryRetriever;
}

export class Brain {
  private config: BrainConfig;
  private deps: BrainDependencies;

  constructor(config: BrainConfig, deps: BrainDependencies) {
    this.config = config;
    this.deps = deps;
  }

  /** Assemble the full context for one turn of conversation */
  async assembleContext(input: {
    userMessage: string;
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
    weather: WeatherData | null;
    schedule: ScheduleItem[];
    mood: MoodState;
  }): Promise<AssembledContext> {
    // Retrieve relevant memories
    const memories = await this.deps.memoryRetriever.retrieve({
      message: input.userMessage,
      mood: input.mood.label,
      limit: 5,
    });

    // Build messages array
    const messages = [
      ...input.conversationHistory.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: input.userMessage },
    ];

    // Render system prompt using persona template
    const rendered = this.deps.promptEngine.render('dj-persona', {
      djName: this.config.djName,
      timeContext: {
        now: new Date().toISOString(),
        timeOfDay: this.getTimeOfDay(),
        dayOfWeek: this.getDayOfWeek(),
      },
      weather: input.weather ? this.formatWeather(input.weather) : undefined,
      schedule: input.schedule.map((s) => ({
        title: s.title,
        time: s.time,
      })),
      memories: memories.map((m) => ({
        content: m.content,
        type: m.type,
        createdAt: m.createdAt,
      })),
      userMood: input.mood.label,
    });

    // Inject memory context into system prompt
    const memoryContext = this.formatMemories(memories);
    const fullSystemPrompt = `${rendered.systemPrompt}\n\n${memoryContext}`.trim();

    return {
      systemPrompt: fullSystemPrompt,
      messages,
      mood: input.mood,
      weather: input.weather,
      schedule: input.schedule,
      memories,
    };
  }

  /** Analyze mood from a user message (simple keyword-based, v1) */
  analyzeMood(text: string, previousMood: MoodState): MoodState {
    const positiveWords = ['开心', '高兴', '愉快', '好', '棒', '喜欢', '哈哈', '爱'];
    const negativeWords = ['难过', '伤心', '烦', '累', '焦虑', '压力', '不开心', '低落'];
    const energeticWords = ['兴奋', '激动', '冲', '燃', '嗨', '炸'];
    const calmWords = ['困', '累', '懒', '休息', '躺', '安静', '放松'];

    let valence = previousMood.valence;
    let energy = previousMood.energy;

    for (const word of positiveWords) {
      if (text.includes(word)) valence = Math.min(valence + 0.1, 1.0);
    }
    for (const word of negativeWords) {
      if (text.includes(word)) valence = Math.max(valence - 0.1, -1.0);
    }
    for (const word of energeticWords) {
      if (text.includes(word)) energy = Math.min(energy + 0.15, 1.0);
    }
    for (const word of calmWords) {
      if (text.includes(word)) energy = Math.max(energy - 0.15, -1.0);
    }

    // Gradual regression toward neutral
    valence = valence * 0.95;
    energy = energy * 0.95;

    // Clamp change to max 0.3 per turn
    valence = this.clamp(valence, previousMood.valence - 0.3, previousMood.valence + 0.3);
    energy = this.clamp(energy, previousMood.energy - 0.3, previousMood.energy + 0.3);

    return {
      valence: this.round(valence),
      energy: this.round(energy),
      label: this.moodToLabel(valence, energy),
      confidence: 0.5,
      updatedAt: new Date().toISOString(),
    };
  }

  // ==================== Private ====================

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) return '深夜';
    if (hour < 9) return '清晨';
    if (hour < 12) return '上午';
    if (hour < 14) return '中午';
    if (hour < 18) return '下午';
    if (hour < 21) return '傍晚';
    return '深夜';
  }

  private getDayOfWeek(): string {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[new Date().getDay()] ?? '未知';
  }

  private formatWeather(w: WeatherData): Record<string, unknown> {
    return {
      temperature: w.temperature,
      condition: w.condition,
      city: w.city,
    };
  }

  private formatMemories(memories: MemoryEntry[]): string {
    if (!memories.length) return '';

    const lines = memories.map(
      (m) =>
        `- (${new Date(m.createdAt).toLocaleDateString('zh-CN')}) [${m.type}] ${m.content}`,
    );

    return `【关于听众的记忆 — 请在对话中自然地参考，不要生硬复述】\n${lines.join('\n')}\n\n当用户提到相关话题时，你可以自然地引用这些记忆。如果用户纠正了某个记忆，以用户的说法为准。`;
  }

  private moodToLabel(valence: number, energy: number) {
    if (valence >= 0.3 && energy >= 0.3) return 'cheerful';
    if (valence >= 0.3 && energy < 0.3) return 'chill';
    if (valence < -0.2 && energy < 0) return 'melancholy';
    if (energy >= 0.5) return 'energetic';
    return 'neutral';
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private round(n: number): number {
    return Math.round(n * 100) / 100;
  }
}
