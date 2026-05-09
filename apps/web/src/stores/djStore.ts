// @ai-radio/web — DJ state
// ===================================================================

import { create } from 'zustand';
import type { DJState } from '../types';

interface DJStoreState extends DJState {
  /** Weather info */
  weather: { temperature: number; condition: string; city: string } | null;

  // Actions
  updateFromServer: (state: Partial<DJState>) => void;
  setWeather: (weather: DJStoreState['weather']) => void;
}

export const useDJStore = create<DJStoreState>((set) => ({
  status: 'online',
  mood: 'neutral',
  thinking: 'idle',
  currentSegment: null,
  weather: null,

  updateFromServer: (partial) => set(partial),
  setWeather: (weather) => set({ weather }),
}));
