// @ai-radio/prompts — Weather context injection
// ===================================================================

import type { PromptModule } from '../types';

/**
 * Weather module — injects weather data as conversation context.
 *
 * Only activates when weather data is available.
 * Weather affects DJ tone and music recommendations.
 */
export const weatherModule: PromptModule = {
  name: 'weather',
  priority: 30,

  render(ctx) {
    if (!ctx.weather) return null;

    const { temperature, condition, city } = ctx.weather;

    // Weather → mood suggestion
    const weatherMood = getWeatherMood(condition, temperature);

    return `## 天气信息

当前天气: ${city} ${temperature}°C ${condition}

### 天气情绪映射
- 推荐情绪: ${weatherMood.mood}
- 推荐流派: ${weatherMood.genres.join('、')}

### 使用方式
- 如果用户主动提及天气，自然地聊
- 可以根据天气推荐相应的音乐
- 不要生硬地播报天气（除非用户要求）
- 在合适的时机将天气融入对话`;
  },
};

// ===================================================================
// Weather → mood mapping
// ===================================================================

function getWeatherMood(
  condition: string,
  temp: number,
): { mood: string; genres: string[] } {
  const c = condition.toLowerCase();

  if (c.includes('雨')) {
    return {
      mood: 'chill',
      genres: ['jazz', 'lofi', 'ballad', 'ambient'],
    };
  }
  if (c.includes('雪')) {
    return {
      mood: 'chill',
      genres: ['jazz', 'classical', 'ambient', 'folk'],
    };
  }
  if (c.includes('晴') && temp > 25) {
    return {
      mood: 'cheerful',
      genres: ['citypop', 'funk', 'pop', 'indie'],
    };
  }
  if (c.includes('阴') || c.includes('多云')) {
    return {
      mood: 'neutral',
      genres: ['jazz', 'indie', 'folk', 'pop'],
    };
  }

  // Default
  return {
    mood: 'neutral',
    genres: ['jazz', 'pop', 'indie'],
  };
}
