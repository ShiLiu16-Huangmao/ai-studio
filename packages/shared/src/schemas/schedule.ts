// @ai-radio/shared — Schedule item schema
// ===================================================================

import { z } from 'zod';

/**
 * 日程/提醒事项
 *
 * 用户设定的定时提醒，可用于 DJ 自动播报
 */
export const ScheduleItemSchema = z.object({
  /** 日程唯一标识 */
  id: z.string(),

  /** 日程标题 */
  title: z.string().min(1).max(200),

  /**
   * 提醒时间 (HH:mm 格式)
   * @example "09:30"
   */
  time: z.string().regex(/^\d{2}:\d{2}$/),

  /**
   * 提醒日期 (YYYY-MM-DD 格式)
   * null 表示每日提醒
   * @example "2026-05-10"
   */
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),

  /**
   * 重复模式
   *
   * daily  — 每天
   * weekly — 每周
   * none   — 不重复（单次提醒）
   */
  repeat: z.enum(['daily', 'weekly', 'none']).nullable(),

  /** 是否启用 */
  enabled: z.boolean(),
});

export type ScheduleItem = z.infer<typeof ScheduleItemSchema>;
