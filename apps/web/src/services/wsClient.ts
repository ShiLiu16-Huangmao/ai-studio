// @ai-radio/web — WebSocket client (mock for MVP)
// ===================================================================

import { useAppStore } from '../stores/appStore';
import { useDJStore } from '../stores/djStore';
import { usePlayerStore } from '../stores/playerStore';
import { useChatStore } from '../stores/chatStore';

type EventHandler = (event: { type: string; payload: unknown; timestamp: number; seq: number }) => void;

/**
 * WebSocket client manager.
 * MVP: supports both real WS and mock mode (no server needed).
 */
class WSClient {
  private ws: WebSocket | null = null;
  private handlers = new Set<EventHandler>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /** Connect to the server (or mock mode) */
  connect(): void {
    const store = useAppStore.getState();
    store.setConnectionStatus('connecting');

    try {
      this.ws = new WebSocket(`ws://${location.hostname}:3001/ws`);

      this.ws.onopen = () => {
        store.setConnectionStatus('connected');
      };

      this.ws.onmessage = (e: MessageEvent<string>) => {
        try {
          const event = JSON.parse(e.data) as {
            type: string;
            payload: unknown;
            timestamp: number;
            seq: number;
          };
          this.dispatch(event);
        } catch {
          // Ignore malformed messages
        }
      };

      this.ws.onclose = () => {
        store.setConnectionStatus('disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        // onclose will fire after this
      };
    } catch {
      // WebSocket unavailable (SSR, etc.)
      store.setConnectionStatus('disconnected');
    }
  }

  /** Disconnect */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  /** Register event handler */
  on(handler: EventHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /** Run in mock mode (no server needed) */
  enableMockMode(): void {
    useAppStore.getState().setConnectionStatus('connected');

    // Simulate DJ going online
    setTimeout(() => {
      this.dispatch({
        type: 'dj:state',
        payload: {
          status: 'online',
          mood: 'chill',
          thinking: 'idle',
          currentSegment: '深夜电台',
        },
        timestamp: Date.now(),
        seq: 1,
      });
    }, 500);
  }

  // ==================== Private ====================

  private dispatch(event: { type: string; payload: unknown; timestamp: number; seq: number }): void {
    // Update stores based on event type
    this.syncStore(event);

    // Notify handlers
    for (const handler of this.handlers) {
      try { handler(event); } catch { /* ignore handler errors */ }
    }
  }

  private syncStore(event: { type: string; payload: unknown }): void {
    const payload = event.payload as Record<string, unknown>;

    switch (event.type) {
      case 'connected':
        useAppStore.getState().setConnectionStatus('connected');
        break;

      case 'dj:state':
        useDJStore.getState().updateFromServer(payload as Record<string, never>);
        break;

      case 'ai:thinking':
        useDJStore.getState().updateFromServer({ thinking: 'thinking' });
        break;

      case 'ai:speaking':
        useDJStore.getState().updateFromServer({ thinking: 'speaking' });
        break;

      case 'music:playing':
        usePlayerStore.getState().play({
          id: (payload.track as Record<string, string>)?.id ?? 'unknown',
          name: (payload.track as Record<string, string>)?.name ?? 'Unknown',
          artist: (payload.track as Record<string, string>)?.artist ?? '',
          album: (payload.track as Record<string, string>)?.album ?? '',
          coverUrl: (payload.track as Record<string, string>)?.coverUrl ?? '',
          mp3Url: (payload.track as Record<string, string>)?.mp3Url ?? '',
          duration: (payload.track as Record<string, number>)?.duration ?? 0,
          source: 'netease',
        });
        break;

      case 'player:update': {
        const p = payload as Record<string, number | boolean>;
        if (typeof p.isPlaying === 'boolean') {
          if (p.isPlaying) usePlayerStore.getState().resume();
          else usePlayerStore.getState().pause();
        }
        break;
      }

      case 'chat:token': {
        const token = String(payload.token ?? '');
        useChatStore.getState().appendStreamingText(token);
        break;
      }

      case 'chat:done':
        useChatStore.getState().commitStreamingText();
        useDJStore.getState().updateFromServer({ thinking: 'idle' });
        break;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }
}

export const wsClient = new WSClient();
