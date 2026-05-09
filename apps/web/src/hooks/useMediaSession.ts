// @ai-radio/web — Media Session API hook (lock screen controls)
// ===================================================================

import { useEffect } from 'react';
import { usePlayerStore } from '../stores/playerStore';

/**
 * Set Media Session metadata and action handlers.
 * Shows track info and play/pause controls on lock screen.
 */
export function useMediaSession(): void {
  const track = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    if (track) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name,
        artist: track.artist,
        album: track.album,
        artwork: track.coverUrl
          ? [{ src: track.coverUrl, sizes: '400x400', type: 'image/jpeg' }]
          : [],
      });
    }

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => usePlayerStore.getState().resume()],
      ['pause', () => usePlayerStore.getState().pause()],
      ['stop', () => usePlayerStore.getState().stop()],
    ];

    for (const [action, handler] of handlers) {
      try { navigator.mediaSession.setActionHandler(action, handler); } catch { /* */ }
    }

    return () => {
      for (const [action] of handlers) {
        try { navigator.mediaSession.setActionHandler(action, null); } catch { /* */ }
      }
    };
  }, [track, isPlaying]);
}
