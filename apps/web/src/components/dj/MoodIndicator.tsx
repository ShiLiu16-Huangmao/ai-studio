// @ai-radio/web — DJ Mood indicator
// ===================================================================

import { useDJStore } from '../../stores/djStore';
import type { MoodType } from '../../types';

const MOOD_LABELS: Record<MoodType, string> = {
  chill: 'Chill',
  energetic: '高能',
  melancholy: '感伤',
  cheerful: '愉悦',
  neutral: '平静',
};

export function MoodIndicator(): JSX.Element {
  const mood = useDJStore((s) => s.mood);

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] tracking-wider uppercase text-text-muted">MOOD</span>
      <span className="text-xs text-accent">{MOOD_LABELS[mood] ?? mood}</span>
    </div>
  );
}
