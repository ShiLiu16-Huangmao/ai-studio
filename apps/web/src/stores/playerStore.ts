// @ai-radio/web — Player state
// ===================================================================

import { create } from 'zustand';
import type { Song } from '../types';

interface PlayerState {
  /** Currently playing track */
  currentTrack: Song | null;

  /** Playback queue */
  queue: Song[];

  /** Is currently playing */
  isPlaying: boolean;

  /** Volume (0~1) */
  volume: number;

  /** Playback progress (0~100) */
  progress: number;

  /** Duration in seconds */
  duration: number;

  /** Is audio buffering */
  isBuffering: boolean;

  /** Waveform bar count */
  barCount: number;

  // Actions
  play: (track: Song) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
  setProgress: (p: number) => void;
  setBuffering: (b: boolean) => void;
  addToQueue: (track: Song) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setBarCount: (count: number) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 0.8,
  progress: 0,
  duration: 0,
  isBuffering: false,
  barCount: 8,

  play: (track) =>
    set({
      currentTrack: track,
      isPlaying: true,
      progress: 0,
      duration: track.duration,
    }),

  pause: () => set({ isPlaying: false }),

  resume: () => set({ isPlaying: true }),

  stop: () => set({ currentTrack: null, isPlaying: false, progress: 0 }),

  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),

  setProgress: (p) => set({ progress: p }),

  setBuffering: (b) => set({ isBuffering: b }),

  addToQueue: (track) =>
    set((s) => ({ queue: [...s.queue, track] })),

  removeFromQueue: (id) =>
    set((s) => ({ queue: s.queue.filter((t) => t.id !== id) })),

  clearQueue: () => set({ queue: [] }),

  setBarCount: (count) => set({ barCount: count }),
}));
