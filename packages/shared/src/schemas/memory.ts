// @ai-radio/shared — Memory: user memory, mood memory, recent context
// ===================================================================

import { z } from 'zod';
import { MoodTypeSchema } from './ai';

// ===================================================================
// MemoryType — 记忆分类
// ===================================================================

/**
 * 记忆类型
 *
 * fact         — 事实性信息（"用户养了一只猫"）
 * preference   — 偏好信息（"用户喜欢爵士乐"）
 * event        — 事件信息（"下周三有面试"）
 * emotion      — 情绪快照（"今晚情绪低落"）
 * relationship — 关系信息（"用户和同事张伟关系紧张"）
 */
export const MemoryTypeSchema = z.enum([
  'fact',
  'preference',
  'event',
  'emotion',
  'relationship',
]);

export type MemoryType = z.infer<typeof MemoryTypeSchema>;

// ===================================================================
// UserMemory — 用户记忆条目
// ===================================================================

/**
 * 一条用户长期记忆
 *
 * 从对话中自动提取，持久化存储
 * 包含衰减机制，长时间不被访问会逐渐降低权重
 */
export const UserMemorySchema = z.object({
  /** 记忆唯一标识 */
  id: z.string(),

  /** 记忆分类 */
  type: MemoryTypeSchema,

  /**
   * 自然语言记忆内容
   * @example "用户养了一只叫团团的橘猫"
   * @example "用户喜欢在下雨天听爵士乐"
   */
  content: z.string(),

  /**
   * 检索关键词列表
   * 用于 SQLite LIKE 匹配检索
   * @example ["猫", "宠物", "团团"]
   */
  keywords: z.array(z.string()),

  /**
   * 来源消息 ID
   * 可追溯到原始对话
   */
  sourceMsgId: z.string().nullable(),

  /**
   * 重要性评分 (0.0~1.0)
   * 越高越不容易被遗忘
   * 默认 0.5
   */
  importance: z.number().min(0).max(1).default(0.5),

  /**
   * 被检索访问的次数
   * 用于提升重要性
   */
  accessCount: z.number().int().min(0).default(0),

  /**
   * 上次被检索的时间 (ISO 8601)
   */
  lastAccess: z.string().datetime(),

  /**
   * 衰减因子 (0.0~1.0)
   * 1.0 = 全新记忆，<0.1 = 几乎遗忘
   * 每次被访问时重置为 1.0
   */
  decayFactor: z.number().min(0).max(1).default(1.0),

  /**
   * 记忆创建时间
   */
  createdAt: z.string().datetime(),

  /**
   * 记忆最后更新时间
   */
  updatedAt: z.string().datetime(),
});

export type UserMemory = z.infer<typeof UserMemorySchema>;

// ===================================================================
// MoodMemory — 情绪快照记忆
// ===================================================================

/**
 * 情绪快照记忆
 *
 * 每次对话结束后记录用户的情绪状态
 * 用于长期情绪趋势追踪
 */
export const MoodMemorySchema = z.object({
  /** 记忆唯一标识 */
  id: z.string(),

  /** 当时的情绪标签 */
  mood: MoodTypeSchema,

  /**
   * 情绪效价
   * @minimum -1.0
   * @maximum 1.0
   */
  valence: z.number().min(-1).max(1),

  /**
   * 情绪能量
   * @minimum -1.0
   * @maximum 1.0
   */
  energy: z.number().min(-1).max(1),

  /**
   * 情绪来源
   *
   * user_stated — 用户明确表达
   * detected    — AI 自动检测
   * system      — 系统设定
   */
  source: z.enum(['user_stated', 'detected', 'system']),

  /**
   * 触发场景/上下文描述
   * @example "用户刚下班回家，说今天很累"
   */
  context: z.string().nullable(),

  /**
   * 关联的对话 ID
   */
  conversationId: z.string().nullable(),

  /**
   * 记录时间
   */
  createdAt: z.string().datetime(),
});

export type MoodMemory = z.infer<typeof MoodMemorySchema>;

// ===================================================================
// RecentContext — 近期对话上下文
// ===================================================================

/**
 * 近期对话上下文摘要
 *
 * 用于 Persona Module 在 prompt 组装时注入
 * 包含最近 N 轮对话的关键信息
 */
export const RecentContextSchema = z.object({
  /**
   * 最近 N 条用户记忆（按重要性 + 时间排序）
   */
  memories: z.array(UserMemorySchema),

  /**
   * 最近 N 条情绪记录
   */
  moodHistory: z.array(MoodMemorySchema),

  /**
   * 最近对话中的关键话题提取
   * @example ["工作压力", "周末计划", "喜欢的音乐"]
   */
  recentTopics: z.array(z.string()),

  /**
   * 用户音乐偏好摘要（从记忆中聚合）
   * @example ["jazz", "lofi", "citypop"]
   */
  musicPreferences: z.array(z.string()),

  /**
   * 用户当前情绪趋势描述
   * @example "本周情绪总体偏向低落，今晚有所缓解"
   */
  moodTrend: z.string().nullable(),
});

export type RecentContext = z.infer<typeof RecentContextSchema>;
