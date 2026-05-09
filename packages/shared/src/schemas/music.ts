// @ai-radio/shared — Music: Song, Playlist, PlayerState, NowPlaying
// ===================================================================

import { z } from 'zod';

// ===================================================================
// Song — 单首歌曲
// ===================================================================

/**
 * 音乐来源
 *
 * netease — 网易云音乐
 * local   — 本地文件
 */
export const MusicSourceSchema = z.enum(['netease', 'local']);

export type MusicSource = z.infer<typeof MusicSourceSchema>;

/**
 * 一首完整的歌曲信息
 */
export const SongSchema = z.object({
  /** 歌曲唯一 ID（网易云 ID 或本地文件 hash） */
  id: z.string(),

  /** 歌曲名 */
  name: z.string(),

  /** 歌手/艺术家名 */
  artist: z.string(),

  /** 专辑名 */
  album: z.string(),

  /** 封面图片 URL */
  coverUrl: z.string().url(),

  /** 可播放的音频流 URL */
  mp3Url: z.string().url(),

  /**
   * 歌曲时长（秒）
   * @minimum 1
   */
  duration: z.number().positive(),

  /** 歌曲来源 */
  source: MusicSourceSchema,
});

export type Song = z.infer<typeof SongSchema>;

// ===================================================================
// Playlist — 播放列表
// ===================================================================

/**
 * 播放列表
 */
export const PlaylistSchema = z.object({
  /** 播放列表唯一标识 */
  id: z.string(),

  /** 播放列表标题 */
  title: z.string(),

  /** 播放列表描述/推荐理由 */
  description: z.string().nullable(),

  /** 包含的歌曲列表 */
  songs: z.array(SongSchema),

  /** 总歌曲数 */
  total: z.number().int().min(0),

  /**
   * 推荐/创建时间
   */
  createdAt: z.string().datetime(),
});

export type Playlist = z.infer<typeof PlaylistSchema>;

// ===================================================================
// NowPlaying — 当前正在播放
// ===================================================================

/**
 * 当前播放状态详情
 * 用于 Media Session API 和播放器 UI
 */
export const NowPlayingSchema = z.object({
  /** 当前曲目，队列为空时为 null */
  song: SongSchema.nullable(),

  /**
   * 播放位置（秒）
   * @minimum 0
   */
  position: z.number().min(0),

  /**
   * 总时长（秒）
   * @minimum 0
   */
  duration: z.number().min(0),

  /** 是否正在播放 */
  isPlaying: z.boolean(),

  /** 是否正在缓冲 */
  isBuffering: z.boolean(),
});

export type NowPlaying = z.infer<typeof NowPlayingSchema>;

// ===================================================================
// PlayerState — 播放器完整状态
// ===================================================================

/**
 * 播放器完整状态快照 (Zustand playerStore)
 */
export const PlayerStateSchema = z.object({
  /** 当前播放详情 */
  nowPlaying: NowPlayingSchema,

  /**
   * 播放音量 (0.0 = 静音, 1.0 = 最大)
   * @minimum 0.0
   * @maximum 1.0
   */
  volume: z.number().min(0).max(1),

  /**
   * 播放进度百分比 (0~100)
   */
  progress: z.number().min(0).max(100),

  /** 播放队列（含当前曲目） */
  queue: z.array(SongSchema),

  /**
   * 播放模式
   *
   * sequential — 顺序播放
   * shuffle    — 随机播放
   * repeat_one — 单曲循环
   * repeat_all — 列表循环
   */
  playMode: z.enum(['sequential', 'shuffle', 'repeat_one', 'repeat_all']),
});

export type PlayerState = z.infer<typeof PlayerStateSchema>;

// ===================================================================
// 辅助类型
// ===================================================================

/** 播放器动作指令 */
export const PlayerActionSchema = z.enum(['play', 'pause', 'skip', 'seek', 'volume']);
export type PlayerAction = z.infer<typeof PlayerActionSchema>;
