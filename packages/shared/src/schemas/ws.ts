// @ai-radio/shared — WebSocket event payload schemas
// ===================================================================

import { z } from 'zod';
import { AIResponseSchema } from './ai';
import { SongSchema } from './music';
import { WeatherInfoSchema } from './weather';

// ===================================================================
// Generic WS Envelope
// ===================================================================

/**
 * WebSocket 事件通用信封
 * 所有 WS 消息都包裹在此结构中
 */
export const WSEventEnvelopeSchema = z.object({
  /** 事件类型，如 "chat:message", "audio:chunk" */
  type: z.string(),

  /** 事件携带的数据载荷 */
  payload: z.unknown(),

  /**
   * 事件发送时间戳 (毫秒)
   */
  timestamp: z.number(),

  /**
   * 事件序号 (递增，用于重连去重)
   */
  seq: z.number().int().min(0),
});

export type WSEventEnvelope = z.infer<typeof WSEventEnvelopeSchema>;

// ===================================================================
// ClientToServerEvents — 客户端发送的事件载荷
// ===================================================================

/**
 * chat:message — 用户发送聊天消息
 */
export const ChatMessagePayloadSchema = z.object({
  /** 目标会话 ID */
  conversationId: z.string(),

  /**
   * 用户消息文本
   * @minLength 1
   * @maxLength 5000
   */
  text: z.string().min(1).max(5000),
});

/**
 * chat:stop — 用户中断 AI 生成
 */
export const ChatStopPayloadSchema = z.object({
  /** 要中断的会话 ID */
  conversationId: z.string(),
});

/**
 * player:action — 播放器控制指令
 */
export const PlayerActionPayloadSchema = z.object({
  /** 播放动作 */
  action: z.enum(['play', 'pause', 'skip', 'seek', 'volume']),

  /**
   * 动作参数值
   * seek → 目标秒数, volume → 0~1
   */
  value: z.number().optional(),

  /** 目标曲目 ID（skip 时可选） */
  trackId: z.string().optional(),
});

/**
 * player:queue — 播放队列更新
 */
export const PlayerQueuePayloadSchema = z.object({
  /** 曲目 ID 列表 */
  trackIds: z.array(z.string()),

  /**
   * 操作类型
   *
   * add     — 追加到队尾
   * remove  — 移除指定曲目
   * replace — 替换整个队列
   * clear   — 清空队列
   */
  action: z.enum(['add', 'remove', 'replace', 'clear']),
});

/**
 * user:presence — 用户在线状态
 */
export const UserPresencePayloadSchema = z.object({
  status: z.enum(['online', 'away']),
});

/**
 * user:preference — 用户更新偏好
 */
export const UserPreferencePayloadSchema = z.object({
  /** 偏好键名 */
  key: z.string(),

  /** 偏好值（任意 JSON） */
  value: z.unknown(),
});

/**
 * ping — 心跳请求
 */
export const PingPayloadSchema = z.object({});

// ===================================================================
// ServerToClientEvents — 服务端推送的事件载荷
// ===================================================================

/**
 * chat:token — 流式文本 token
 */
export const ChatTokenPayloadSchema = z.object({
  /** 会话 ID */
  conversationId: z.string(),

  /** 消息 ID（本轮回复的标识） */
  messageId: z.string(),

  /** 文本 token 内容（可能是一个字、词或标点） */
  token: z.string(),

  /** token 序号 (从 0 开始递增) */
  index: z.number().int().min(0),
});

/**
 * chat:done — AI 回复完成
 */
export const ChatDonePayloadSchema = z.object({
  /** 会话 ID */
  conversationId: z.string(),

  /** 完成的消息 ID */
  messageId: z.string(),

  /** AI 结构化响应 */
  response: AIResponseSchema.nullable(),

  /** 错误信息（流式生成异常时） */
  error: z.string().nullable(),
});

/**
 * chat:action — AI 触发了结构化动作
 * 通常在 chat:done 之前发送
 */
export const ChatActionPayloadSchema = z.object({
  /** 动作名称 */
  action: z.string(),

  /** 动作参数 */
  params: z.record(z.string(), z.unknown()),
});

/**
 * audio:start — 音频流开始
 */
export const AudioStartPayloadSchema = z.object({
  /** 会话 ID */
  conversationId: z.string(),

  /** 消息 ID */
  messageId: z.string(),

  /**
   * 音频格式
   * @example "mp3"
   */
  format: z.string(),

  /**
   * 采样率
   * @example 44100
   */
  sampleRate: z.number().int().positive(),
});

/**
 * audio:chunk — 音频数据块
 */
export const AudioChunkPayloadSchema = z.object({
  /** 会话 ID */
  conversationId: z.string(),

  /** 消息 ID */
  messageId: z.string(),

  /** 音频数据 (base64 编码) */
  data: z.string(),

  /** 块序号 (从 0 递增) */
  sequence: z.number().int().min(0),

  /** 本块对应的文字（字幕同步） */
  sentence: z.string(),

  /** 音频格式 */
  format: z.string(),
});

/**
 * audio:end — 音频流结束
 */
export const AudioEndPayloadSchema = z.object({
  /** 会话 ID */
  conversationId: z.string(),

  /** 消息 ID */
  messageId: z.string(),
});

/**
 * music:track — 音乐曲目推送
 */
export const MusicTrackPayloadSchema = z.object({
  /** 曲目信息 */
  track: SongSchema,

  /** DJ 推荐理由（可选） */
  recommendReason: z.string().optional(),
});

/**
 * music:playlist — 播放列表推送
 */
export const MusicPlaylistPayloadSchema = z.object({
  /** 曲目列表 */
  tracks: z.array(SongSchema),

  /** 播放列表标题 */
  title: z.string(),

  /** 推荐上下文描述 */
  context: z.string(),
});

/**
 * weather:update — 天气数据推送
 */
export const WeatherUpdatePayloadSchema = z.object({
  weather: WeatherInfoSchema,
});

/**
 * schedule:update — 日程数据推送
 */
export const ScheduleUpdatePayloadSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      /** HH:mm 格式 */
      time: z.string(),
      /** YYYY-MM-DD 格式 */
      date: z.string().nullable(),
      enabled: z.boolean(),
    }),
  ),
});

/**
 * dj:state — DJ 状态变更推送
 */
export const DJStatePayloadSchema = z.object({
  /** DJ 当前状态 */
  status: z.enum(['online', 'broadcasting', 'resting']),

  /** 当前情绪 */
  mood: z.enum(['chill', 'energetic', 'melancholy', 'cheerful', 'neutral']),

  /** 当前播报环节描述 */
  currentSegment: z.string().nullable(),
});

/**
 * dj:mood — DJ 情绪变更推送
 */
export const DJMoodPayloadSchema = z.object({
  /** 新情绪标签 */
  mood: z.enum(['chill', 'energetic', 'melancholy', 'cheerful', 'neutral']),

  /** 变更原因 */
  reason: z.string().optional(),
});

/**
 * error — 错误信息推送
 */
export const ErrorPayloadSchema = z.object({
  /** 错误码 */
  code: z.string(),

  /** 错误描述 */
  message: z.string(),

  /** 是否可恢复（true = 可重试, false = 需重新连接） */
  recoverable: z.boolean(),
});

/**
 * system:event — 系统事件推送
 */
export const SystemEventPayloadSchema = z.object({
  /** 事件名称 */
  event: z.string(),

  /** 事件描述 */
  message: z.string().optional(),

  /** 附加数据 */
  data: z.record(z.string(), z.unknown()).optional(),
});

/**
 * connected — 连接成功后的欢迎信息
 */
export const ConnectedPayloadSchema = z.object({
  /** 服务端版本号 */
  serverVersion: z.string(),

  /** 分配的客户端 ID */
  clientId: z.string(),
});

/**
 * pong — 心跳响应
 */
export const PongPayloadSchema = z.object({});

// ===================================================================
// Event Type Maps (compile-time only)
// ===================================================================

/**
 * Client → Server 事件载荷类型映射
 */
export const ClientToServerEventMap = {
  'chat:message': ChatMessagePayloadSchema,
  'chat:typing': ChatStopPayloadSchema,
  'chat:stop': ChatStopPayloadSchema,
  'player:action': PlayerActionPayloadSchema,
  'player:sync': z.object({}),
  'player:queue': PlayerQueuePayloadSchema,
  'user:presence': UserPresencePayloadSchema,
  'user:preference': UserPreferencePayloadSchema,
  ping: PingPayloadSchema,
} as const;

/**
 * Server → Client 事件载荷类型映射
 */
export const ServerToClientEventMap = {
  connected: ConnectedPayloadSchema,
  'chat:token': ChatTokenPayloadSchema,
  'chat:done': ChatDonePayloadSchema,
  'chat:action': ChatActionPayloadSchema,
  'audio:start': AudioStartPayloadSchema,
  'audio:chunk': AudioChunkPayloadSchema,
  'audio:end': AudioEndPayloadSchema,
  'music:track': MusicTrackPayloadSchema,
  'music:playlist': MusicPlaylistPayloadSchema,
  'weather:update': WeatherUpdatePayloadSchema,
  'schedule:update': ScheduleUpdatePayloadSchema,
  'dj:state': DJStatePayloadSchema,
  'dj:mood': DJMoodPayloadSchema,
  'system:event': SystemEventPayloadSchema,
  error: ErrorPayloadSchema,
  pong: PongPayloadSchema,
} as const;
