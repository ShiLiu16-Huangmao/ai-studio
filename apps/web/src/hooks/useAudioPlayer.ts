// @ai-radio/web — Audio player hook (mock for MVP)
// ===================================================================

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../stores/playerStore';
import { useAppStore } from '../stores/appStore';

/**
 * Manages audio playback lifecycle.
 * MVP: simulates progress for mock tracks.
 */
export function useAudioPlayer(): void {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const duration = usePlayerStore((s) => s.duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying && duration > 0) {
      intervalRef.current = setInterval(() => {
        const currentProgress = usePlayerStore.getState().progress;
        const newProgress = currentProgress + (0.25 / duration) * 100;
        if (newProgress >= 100) {
          usePlayerStore.getState().stop();
        } else {
          usePlayerStore.getState().setProgress(newProgress);
        }
      }, 250);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, duration]);

  // Update app mode when playing
  useEffect(() => {
    if (isPlaying) {
      useAppStore.getState().setMode('playing');
    } else {
      useAppStore.getState().setMode('idle');
    }
  }, [isPlaying]);
}
