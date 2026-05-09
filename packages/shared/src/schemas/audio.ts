// @ai-radio/shared — Audio: TTS request, audio chunks, and queue
// ===================================================================

import { z } from 'zod';

// ===================================================================
// AudioFormat — 音频格式配置
// ===================================================================

/**
 * 音频容器格式
 *
 * mp3 — MPEG Audio Layer III
 * pcm — 原始 PCM 数据
 * wav — WAV 容器
 */
export const AudioContainerSchema = z.enum(['mp3', 'pcm', 'wav']);

export type AudioContainer = z.infer<typeof AudioContainerSchema>;

/**
 * 音频编码格式参数
 */
export const AudioFormatSchema = z.object({
  /** 容器格式 */
  container: AudioContainerSchema,

  /**
   * 采样率 (Hz)
   * 标准值: 44100 (CD 音质), 22050, 16000 (语音)
   */
  sampleRate: z.number().int().positive(),

  /**
   * 声道数
   * 1 = 单声道 (TTS 语音), 2 = 立体声 (音乐)
   */
  channels: z.number().int().min(1).max(2),

  /**
   * 比特率 (bps)
   * 语音推荐 64000, 音乐推荐 128000
   */
  bitrate: z.number().int().positive(),
});

export type AudioFormat = z.infer<typeof AudioFormatSchema>;

// ===================================================================
// TTSRequest — TTS 合成请求
// ===================================================================

/**
 * 文本转语音请求
 *
 * 提交给 TTS 服务的请求体
 */
export const TTSRequestSchema = z.object({
  /**
   * 待合成的文本
   * 通常是一个完整句子
   * @minLength 1
   * @maxLength 500
   */
  text: z.string().min(1).max(500),

  /**
   * 目标音色 ID
   * Fish Audio 的 voice_id
   */
  voiceId: z.string(),

  /** 输出音频格式 */
  format: AudioFormatSchema,

  /**
   * 请求序号，用于客户端按序重组音频
   * @minimum 0
   */
  sequence: z.number().int().min(0).default(0),
});

export type TTSRequest = z.infer<typeof TTSRequestSchema>;

// ===================================================================
// AudioChunk — 音频数据块
// ===================================================================

/**
 * 单个音频数据块
 *
 * TTS 服务流式返回的最小单位
 * 通过 WebSocket 推送到客户端
 */
export const AudioChunkSchema = z.object({
  /**
   * 所属消息 ID
   * 对应 ChatMessage.id
   */
  messageId: z.string(),

  /**
   * 音频数据 (base64 编码)
   * 客户端解码后送入 AudioBuffer
   */
  data: z.string(),

  /**
   * 数据块序号 (从 0 开始递增)
   * 用于客户端按序组装和丢包检测
   */
  sequence: z.number().int().min(0),

  /**
   * 本块对应的文字内容
   * 用于客户端字幕同步高亮
   */
  sentence: z.string(),

  /** 音频编码格式 */
  format: AudioFormatSchema,

  /**
   * 本块音频时长（秒）
   * 用于计算播放进度
   */
  duration: z.number().positive(),
});

export type AudioChunk = z.infer<typeof AudioChunkSchema>;

// ===================================================================
// AudioQueue — 音频播放队列
// ===================================================================

/**
 * 客户端音频播放队列
 *
 * 管理从 WebSocket 接收到的 AudioChunk 的播放顺序
 */
export const AudioQueueSchema = z.object({
  /** 队列中的音频块，按 sequence 排序 */
  chunks: z.array(AudioChunkSchema),

  /** 当前正在播放的 chunk sequence */
  currentSequence: z.number().int().min(-1).default(-1),

  /** 队列总时长（秒），= 所有 chunk 时长之和 */
  totalDuration: z.number().min(0),

  /** 是否正在播放 */
  isPlaying: z.boolean(),
});

export type AudioQueue = z.infer<typeof AudioQueueSchema>;

// ===================================================================
// Ducking — 音频闪避控制
// ===================================================================

/**
 * 音频闪避状态（DJ 说话时音乐自动降低音量）
 */
export const DuckingStateSchema = z.object({
  /** 是否正在闪避（即 DJ 正在说话） */
  isDucking: z.boolean(),

  /**
   * 闪避时音乐目标音量比例 (0.0~1.0)
   * 默认 0.2 = 降低到 20%
   */
  duckedVolume: z.number().min(0).max(1).default(0.2),

  /**
   * 淡入淡出过渡时间（毫秒）
   * 默认 300ms
   */
  fadeDurationMs: z.number().int().positive().default(300),
});

export type DuckingState = z.infer<typeof DuckingStateSchema>;
