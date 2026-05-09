// @ai-radio/web — Spinning vinyl disc animation
// ===================================================================

import { usePlayerStore } from '../../stores/playerStore';

export function VinylDisc(): JSX.Element {
  const track = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[240px] items-center justify-center">
      {/* Outer ring */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-gray-900
          border border-white/5 shadow-2xl ${isPlaying ? 'vinyl-spin' : ''}`}
      />

      {/* Grooves */}
      <div className="absolute inset-2 rounded-full border border-white/3" />
      <div className="absolute inset-6 rounded-full border border-white/3" />

      {/* Center label */}
      <div className="absolute inset-[30%] rounded-full bg-surface flex flex-col items-center justify-center z-10">
        <span className="text-[9px] text-accent uppercase tracking-wider digital">
          AI RADIO
        </span>
        <span className="text-[7px] text-text-muted mt-0.5">
          45 RPM
        </span>
      </div>

      {/* Center hole */}
      <div className="absolute w-2 h-2 rounded-full bg-bg z-20" />

      {/* Track info overlay (bottom) */}
      {track && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          <p className="text-xs text-text-primary truncate max-w-[200px]">{track.name}</p>
          <p className="text-[10px] text-text-muted">{track.artist}</p>
        </div>
      )}
    </div>
  );
}
