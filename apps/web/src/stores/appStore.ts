// @ai-radio/web — App global state
// ===================================================================

import { create } from 'zustand';
import type { ConnectionStatus, AppMode } from '../types';

interface AppState {
  /** WebSocket connection status */
  connectionStatus: ConnectionStatus;

  /** Current app interaction mode */
  mode: AppMode;

  /** Is PWA installed to home screen */
  isPWAInstalled: boolean;

  // Actions
  setConnectionStatus: (status: ConnectionStatus) => void;
  setMode: (mode: AppMode) => void;
  setPWAInstalled: (installed: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  connectionStatus: 'disconnected',
  mode: 'idle',
  isPWAInstalled: false,

  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setMode: (mode) => set({ mode }),
  setPWAInstalled: (installed) => set({ isPWAInstalled: installed }),
}));
