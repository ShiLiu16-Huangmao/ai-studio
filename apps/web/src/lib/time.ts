// @ai-radio/web — Time formatting utilities
// ===================================================================

/** Format seconds to mm:ss */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/** Get time of day label */
export function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 6) return '深夜';
  if (h < 9) return '清晨';
  if (h < 12) return '上午';
  if (h < 14) return '中午';
  if (h < 18) return '下午';
  if (h < 21) return '傍晚';
  return '深夜';
}

/** Format current time HH:mm */
export function nowHHMM(): string {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}
