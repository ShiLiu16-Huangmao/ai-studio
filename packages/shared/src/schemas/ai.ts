// @ai-radio/shared — AI state, response, and mood schemas
// ===================================================================

import { z } from 'zod';

// ===================================================================
// MoodType — 情绪标签枚举
// ===================================================================

/**
 * 情绪标签
 *
 * chill      — 放松、慵懒、深夜氛围
 * energetic  — 高能量、兴奋、活跃
 * melancholy — 忧郁、感伤、怀旧
 * cheerful   — 愉快、轻松、明媚
 * neutral    — 中性、平静、默认状态
 */
export const MoodTypeSchema = z.enum([
  'chill',
  'energetic',
  'melancholy',
  'cheerful',
  'neutral',
]);

/** 运行时验证: MoodTypeSchema.parse("chill") */
export type MoodType = z.infer<typeof MoodTypeSchema>;

// ===================================================================
// ThinkingState — AI 思考/推理中间状态
// ===================================================================

/**
 * AI 处理阶段状态
 *
 * idle       — 空闲，等待用户输入
 * thinking   — 正在理解用户意图
 * searching  — 正在检索相关信息（天气、记忆、音乐）
 * composing  — 正在生成回复内容
 * speaking   — 正在输出语音
 * done       — 本轮回复完成
 */
export const ThinkingStateSchema = z.enum([
  'idle',
  'thinking',
  'searching',
  'composing',
  'speaking',
  'done',
]);

export type ThinkingState = z.infer<typeof ThinkingStateSchema>;

// ===================================================================
// AIState — DJ/AI 完整运行状态
// ===================================================================

/**
 * AI 运行时完整状态快照
 */
export const AIStateSchema = z.object({
  /**
   * 当前思考阶段
   * @example "composing"
   */
  thinking: ThinkingStateSchema,

  /**
   * 当前情绪标签
   * @example "chill"
   */
  mood: MoodTypeSchema,

  /**
   * 情绪效价 (-1.0 = 负面, 1.0 = 正面)
   * 用于描述 DJ 输出的情感倾向
   * @minimum -1.0
   * @maximum 1.0
   */
  valence: z.number().min(-1).max(1),

  /**
   * 情绪能量 (-1.0 = 低能/倦怠, 1.0 = 高能/兴奋)
   * 影响 DJ 说话的节奏感和热情程度
   * @minimum -1.0
   * @maximum 1.0
   */
  energy: z.number().min(-1).max(1),

  /**
   * 情绪检测置信度 (0.0~1.0)
   * 0.0 = 完全不确定，1.0 = 非常确定
   */
  confidence: z.number().min(0).max(1),

  /**
   * 状态更新时间 (ISO 8601)
   * @example "2026-05-10T02:30:00.000Z"
   */
  updatedAt: z.string().datetime(),
});

export type AIState = z.infer<typeof AIStateSchema>;

// ===================================================================
// AIResponse — Claude 结构化输出
// ===================================================================

/**
 * AI 结构化响应的动作类型
 *
 * none                — 纯文本，无附加动作
 * recommend_music     — 推荐音乐
 * play_music         — 直接播放指定曲目
 * broadcast_weather  — 播报天气
 * broadcast_schedule — 播报日程
 */
export const AIActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('none'),
    params: z.object({}),
  }),
  z.object({
    action: z.literal('recommend_music'),
    params: z.object({
      /** 目标情绪 */
      mood: z.string().optional(),
      /** 音乐流派 */
      genre: z.string().optional(),
      /** 搜索关键词 */
      query: z.string().optional(),
    }),
  }),
  z.object({
    action: z.literal('play_music'),
    params: z.object({
      /** 目标曲目 ID */
      trackId: z.string(),
    }),
  }),
  z.object({
    action: z.literal('broadcast_weather'),
    params: z.object({}),
  }),
  z.object({
    action: z.literal('broadcast_schedule'),
    params: z.object({}),
  }),
]);

export type AIAction = z.infer<typeof AIActionSchema>;

/**
 * Claude 完整结构化响应
 *
 * text   — DJ 自然语言回复文本（必定存在）
 * action — 可选的结构化动作指令
 * mood   — 可选的情绪分析结果（用于后续 mood 追踪）
 */
export const AIResponseSchema = z.object({
  /** DJ 回复文本，纯自然语言 */
  text: z.string(),

  /** 结构化动作（音乐推荐、天气播报等），无动作时为 null */
  action: AIActionSchema.nullable(),

  /** 本轮对话的情绪分析，用于 mood 系统更新 */
  mood: z
    .object({
      /** 效价变化建议 */
      valence: z.number().min(-1).max(1),
      /** 能量变化建议 */
      energy: z.number().min(-1).max(1),
    })
    .nullable(),
});

export type AIResponse = z.infer<typeof AIResponseSchema>;
