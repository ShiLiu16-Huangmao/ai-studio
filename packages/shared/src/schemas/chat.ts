// @ai-radio/shared — Chat message, role, and event schemas
// ===================================================================

import { z } from 'zod';
import { MoodTypeSchema } from './ai';

// ===================================================================
// ChatRole — 消息角色
// ===================================================================

/**
 * 对话消息角色
 *
 * user      — 用户发送的消息
 * assistant — DJ/AI 回复的消息
 * system    — 系统注入的提示/指令（不展示给用户）
 */
export const ChatRoleSchema = z.enum(['user', 'assistant', 'system']);

export type ChatRole = z.infer<typeof ChatRoleSchema>;

// ===================================================================
// ChatMessage — 单条对话消息
// ===================================================================

/**
 * 一条完整的对话消息
 */
export const ChatMessageSchema = z.object({
  /** 消息唯一标识 (cuid) */
  id: z.string(),

  /** 所属会话 ID */
  conversationId: z.string(),

  /** 消息发送者角色 */
  role: ChatRoleSchema,

  /** 消息文本内容 */
  content: z.string(),

  /**
   * 关联的结构化元数据
   * 例如 AI 推荐音乐时携带的曲目信息
   */
  metadata: z
    .object({
      /** 触发的动作类型 */
      action: z.string().optional(),
      /** 关联的曲目列表 */
      tracks: z.array(z.record(z.string(), z.unknown())).optional(),
    })
    .nullable(),

  /**
   * 该消息消耗的 LLM token 数量
   * 仅在 assistant 消息上有值
   */
  tokensUsed: z.number().int().positive().nullable(),

  /**
   * 消息创建时间 (ISO 8601)
   */
  createdAt: z.string().datetime(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// ===================================================================
// ChatEvent — 聊天相关事件类型 (客户端内部使用)
// ===================================================================

/**
 * 聊天事件类型枚举
 *
 * message_sent    — 用户已发送消息
 * token_received  — 收到一个流式 token
 * response_done   — AI 回复完成
 * action_trigger  — 触发了结构化动作
 * error_occurred  — 发生错误
 */
export const ChatEventTypeSchema = z.enum([
  'message_sent',
  'token_received',
  'response_done',
  'action_trigger',
  'error_occurred',
]);

export type ChatEventType = z.infer<typeof ChatEventTypeSchema>;

/**
 * 聊天事件 — 前端内部事件总线用
 */
export const ChatEventSchema = z.object({
  /** 事件类型 */
  type: ChatEventTypeSchema,

  /**
   * 事件发生时间戳 (毫秒)
   */
  timestamp: z.number(),

  /** 事件携带的数据 */
  data: z.record(z.string(), z.unknown()).nullable(),
});

export type ChatEvent = z.infer<typeof ChatEventSchema>;

// ===================================================================
// ChatSendInput — 发送消息请求体
// ===================================================================

export const ChatSendInputSchema = z.object({
  /** 会话 ID（可选，不传则创建新会话） */
  conversationId: z.string().optional(),
  /** 用户消息文本 */
  text: z.string().min(1).max(5000),
});

export type ChatSendInput = z.infer<typeof ChatSendInputSchema>;

// ===================================================================
// CreateConversationInput — 创建会话请求体
// ===================================================================

export const CreateConversationInputSchema = z.object({
  /** 可选会话标题，不填则 AI 自动生成 */
  title: z.string().optional(),
});

export type CreateConversationInput = z.infer<typeof CreateConversationInputSchema>;

// ===================================================================
// Conversation — 会话摘要
// ===================================================================

export const ConversationSchema = z.object({
  /** 会话唯一标识 */
  id: z.string(),

  /** 会话标题 */
  title: z.string().nullable(),

  /** 会话整体情绪标签 */
  mood: MoodTypeSchema.nullable(),

  /** 会话创建时间 */
  createdAt: z.string().datetime(),

  /** 最后更新时间 */
  updatedAt: z.string().datetime(),
});

export type Conversation = z.infer<typeof ConversationSchema>;
