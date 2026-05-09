// @ai-radio/web — Current track info display
// ===================================================================

import { usePlayerStore } from '../../stores/playerStore';
import { formatTime } from '../../lib/time';

export function TrackInfo(): JSX.Element {
  const track = usePlayerStore((s) => s.currentTrack);
  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);

  if (!track) return <></>;

  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline">
        <p className="text-sm font-medium text-text-primary truncate flex-1">{track.name}</p>
        <span className="text-[10px] text-accent ml-2 digital">{formatTime(progress * duration / 100)}</span>
      </div>
      <p className="text-[10px] text-text-muted truncate">{track.artist}</p>
    </div>
  );
}
