// @ai-radio/shared — Weather: info and mood correlation
// ===================================================================

import { z } from 'zod';
import { MoodTypeSchema } from './ai';

// ===================================================================
// WeatherInfo — 天气数据
// ===================================================================

/**
 * 天气状况数据
 *
 * 从天气 API 获取，经缓存后用于 DJ prompt 注入
 */
export const WeatherInfoSchema = z.object({
  /**
   * 当前温度（摄氏度）
   */
  temperature: z.number(),

  /**
   * 天气状况描述（中文）
   * @example "晴", "多云", "小雨", "阴", "雪"
   */
  condition: z.string(),

  /**
   * 相对湿度 (%)
   * @minimum 0
   * @maximum 100
   */
  humidity: z.number().min(0).max(100),

  /**
   * 风力等级 (0~12)
   * 0 = 无风, 6 = 强风, 12 = 飓风
   */
  windLevel: z.number().int().min(0).max(12),

  /**
   * 城市名称（从用户偏好读取）
   */
  city: z.string(),

  /**
   * 数据更新时间 (ISO 8601)
   * 用于判断缓存是否过期
   */
  updatedAt: z.string().datetime(),
});

export type WeatherInfo = z.infer<typeof WeatherInfoSchema>;

// ===================================================================
// WeatherMood — 天气→情绪映射
// ===================================================================

/**
 * 天气状况到推荐情绪的映射
 *
 * 不同天气状况会影响 DJ 的语气和音乐推荐偏好
 * 例如雨天 → 推荐 melancholy 风格的爵士/Ballad
 */
export const WeatherMoodSchema = z.object({
  /** 天气状况关键词 */
  condition: z.string(),

  /** 对应的情绪标签 */
  mood: MoodTypeSchema,

  /**
   * 影响权重 (0.0~1.0)
   * 在 mood 计算中天气因素占的比重
   * 默认 0.3 = 30% 权重
   */
  weight: z.number().min(0).max(1).default(0.3),

  /**
   * 推荐的音乐流派
   * @example ["jazz", "ballad"]
   */
  suggestedGenres: z.array(z.string()),
});

export type WeatherMood = z.infer<typeof WeatherMoodSchema>;
