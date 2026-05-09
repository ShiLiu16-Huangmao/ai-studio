// @ai-radio/web — Bottom player control bar
// ===================================================================

import { usePlayerStore } from '../../stores/playerStore';
import { GlassPanel } from '../common/GlassPanel';
import { IconButton } from '../common/IconButton';
import { TrackInfo } from './TrackInfo';
import { Waveform } from './Waveform';

export function PlayerBar(): JSX.Element {
  const track = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const pause = usePlayerStore((s) => s.pause);
  const resume = usePlayerStore((s) => s.resume);
  const stop = usePlayerStore((s) => s.stop);

  const handlePlayPause = (): void => {
    if (!track) return;
    if (isPlaying) pause();
    else resume();
  };

  if (!track) return <></>;

  return (
    <GlassPanel className="px-4 py-2">
      {/* Waveform */}
      <div className="mb-2">
        <Waveform />
      </div>

      {/* Track Info + Controls */}
      <div className="flex items-center gap-3">
        {/* Track cover thumbnail */}
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-elevated">
          {track.coverUrl ? (
            <img src={track.coverUrl} alt={track.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted text-lg">
              🎵
            </div>
          )}
        </div>

        {/* Track name + artist */}
        <div className="flex-1 min-w-0">
          <TrackInfo />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <IconButton label="停止" size="sm" onClick={stop}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </IconButton>
          <IconButton label={isPlaying ? '暂停' : '播放'} size="sm" accent onClick={handlePlayPause}>
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="5" y="4" width="5" height="16" rx="1" />
                <rect x="14" y="4" width="5" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6,3 20,12 6,21" />
              </svg>
            )}
          </IconButton>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2 w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-300 rounded-full"
          style={{ width: `${usePlayerStore.getState().progress}%` }}
        />
      </div>
    </GlassPanel>
  );
}
