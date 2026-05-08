// @ai-radio/scheduler — Scheduler types

/** Task function signature */
export type TaskFn = (ctx: TaskContext) => Promise<void>;

export interface ScheduledTask {
  id: string;
  name: string;
  cron: string;
  fn: TaskFn;
  enabled: boolean;
  lastRun: string | null;
  nextRun: string | null;
}

export interface CronExpression {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

export interface TaskContext {
  taskId: string;
  taskName: string;
  scheduledAt: string;
  firedAt: string;
}
