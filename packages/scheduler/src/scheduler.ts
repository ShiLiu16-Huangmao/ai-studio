// @ai-radio/scheduler — Cron-based task scheduler

import type { ScheduledTask, TaskContext, TaskFn } from './types';

export class Scheduler {
  private tasks = new Map<string, ScheduledTask>();
  private timers = new Map<string, ReturnType<typeof setInterval>>();
  private running = false;

  /** Register a new scheduled task */
  add(id: string, name: string, cron: string, fn: TaskFn): void {
    if (this.tasks.has(id)) {
      throw new Error(`Task "${id}" already registered`);
    }

    const task: ScheduledTask = {
      id,
      name,
      cron,
      fn,
      enabled: true,
      lastRun: null,
      nextRun: null,
    };

    this.tasks.set(id, task);
  }

  /** Remove a scheduled task */
  remove(id: string): void {
    this.stopTask(id);
    this.tasks.delete(id);
  }

  /** Start all scheduled tasks */
  start(): void {
    if (this.running) return;
    this.running = true;

    for (const [id] of this.tasks) {
      this.startTask(id);
    }
  }

  /** Stop all scheduled tasks */
  stop(): void {
    this.running = false;
    for (const [id] of this.timers) {
      clearInterval(id);
    }
    this.timers.clear();
  }

  /** Enable a specific task */
  enable(id: string): void {
    const task = this.tasks.get(id);
    if (task) {
      task.enabled = true;
      this.startTask(id);
    }
  }

  /** Disable a specific task */
  disable(id: string): void {
    const task = this.tasks.get(id);
    if (task) {
      task.enabled = false;
      this.stopTask(id);
    }
  }

  /** Get all registered tasks */
  list(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  /** Force-run a task immediately */
  async runNow(id: string): Promise<void> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task "${id}" not found`);
    }

    const ctx: TaskContext = {
      taskId: task.id,
      taskName: task.name,
      scheduledAt: new Date().toISOString(),
      firedAt: new Date().toISOString(),
    };

    await task.fn(ctx);
    task.lastRun = new Date().toISOString();
  }

  /** Get the number of registered tasks */
  get size(): number {
    return this.tasks.size;
  }

  // ==================== Private ====================

  private startTask(id: string): void {
    const task = this.tasks.get(id);
    if (!task || !task.enabled) return;

    const intervalMs = this.parseCronInterval(task.cron);

    const timer = setInterval(async () => {
      const ctx: TaskContext = {
        taskId: task.id,
        taskName: task.name,
        scheduledAt: new Date().toISOString(),
        firedAt: new Date().toISOString(),
      };

      try {
        await task.fn(ctx);
        task.lastRun = new Date().toISOString();
      } catch (err) {
        console.error(`[Scheduler] Task "${task.name}" failed:`, err);
      }
    }, intervalMs);

    this.timers.set(id, timer);
  }

  private stopTask(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(id);
    }
  }

  /** Simplified cron to ms conversion — supports interval like 5m, 10m etc */
  private parseCronInterval(cron: string): number {
    const parts = cron.split(' ');
    if (parts.length !== 5) {
      return 60_000; // Default: every minute
    }

    const minute = parts[0];
    if (minute && minute.startsWith('*/')) {
      const n = parseInt(minute.slice(2), 10);
      if (n > 0) return n * 60_000;
    }

    // For non-interval patterns, check every 60 seconds
    return 60_000;
  }
}
