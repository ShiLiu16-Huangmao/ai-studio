// @ai-radio/server — WebSocket connection manager
// ===================================================================

import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { logger } from '../utils/logger';
import { eventBus, InternalEvents } from './events';

interface WSClient {
  id: string;
  ws: WebSocket;
  connectedAt: number;
  lastPing: number;
  seq: number;
}

let clientCounter = 0;

export class WSManager {
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, WSClient>();
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  /** Attach WebSocket server to HTTP server */
  attach(httpServer: Server): void {
    this.wss = new WebSocketServer({
      server: httpServer,
      path: '/ws',
    });

    this.wss.on('connection', (ws) => {
      const id = `client_${++clientCounter}`;
      const client: WSClient = {
        id,
        ws,
        connectedAt: Date.now(),
        lastPing: Date.now(),
        seq: 0,
      };

      this.clients.set(id, client);
      logger.info({ clientId: id }, 'WS client connected');

      // Send welcome
      this.send(client, 'connected', {
        serverVersion: '0.0.0',
        clientId: id,
      });

      // Forward internal events to this client
      this.forwardInternalEvents(client);

      // Handle pong
      ws.on('pong', () => {
        client.lastPing = Date.now();
      });

      // Handle close
      ws.on('close', (code, reason) => {
        this.clients.delete(id);
        logger.info({ clientId: id, code, reason: reason.toString() }, 'WS client disconnected');
      });

      // Handle error
      ws.on('error', (err) => {
        logger.error({ clientId: id, err }, 'WS client error');
        this.clients.delete(id);
      });
    });

    // Heartbeat: ping all clients every 30s
    this.pingInterval = setInterval(() => {
      const now = Date.now();
      for (const client of this.clients.values()) {
        if (now - client.lastPing > 60_000) {
          logger.warn({ clientId: client.id }, 'WS client heartbeat timeout');
          client.ws.terminate();
          this.clients.delete(client.id);
        } else {
          client.ws.ping();
        }
      }
    }, 30_000);

    logger.info('WebSocket server attached');
  }

  /** Broadcast event to all connected clients */
  broadcast(type: string, payload: unknown): void {
    const event = JSON.stringify({
      type,
      payload,
      timestamp: Date.now(),
      seq: 0,
    });

    for (const client of this.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(event, (err) => {
          if (err) {
            logger.error({ clientId: client.id, err }, 'WS send error');
          }
        });
      }
    }
  }

  /** Send event to a specific client */
  send(client: WSClient, type: string, payload: unknown): void {
    if (client.ws.readyState !== WebSocket.OPEN) return;

    const event = JSON.stringify({
      type,
      payload,
      timestamp: Date.now(),
      seq: ++client.seq,
    });

    client.ws.send(event, (err) => {
      if (err) {
        logger.error({ clientId: client.id, err }, 'WS send error');
      }
    });
  }

  /** Close all connections gracefully */
  closeAll(code: number, reason: string): void {
    for (const client of this.clients.values()) {
      client.ws.close(code, reason);
    }
    this.clients.clear();

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
  }

  /** Get connected client count */
  get clientCount(): number {
    return this.clients.size;
  }

  /** Forward internal event bus events to all WS clients */
  private forwardInternalEvents(client: WSClient): void {
    // We use a simple approach: listen to key internal events
    // and re-emit them to WS clients. In production, use selective
    // forwarding per client.

    const forward = (internalType: string, wsType: string): void => {
      const handler = (payload: unknown): void => {
        this.send(client, wsType, payload);
      };
      eventBus.on(internalType, handler);

      // Clean up on disconnect
      client.ws.once('close', () => {
        eventBus.off(internalType, handler);
      });
    };

    forward(InternalEvents.AI_THINKING_START, 'ai:thinking');
    forward(InternalEvents.AI_SPEAKING_START, 'ai:speaking');
    forward(InternalEvents.MUSIC_PLAYING_START, 'music:playing');
    forward(InternalEvents.PLAYER_STATE_CHANGED, 'player:update');
  }
}
