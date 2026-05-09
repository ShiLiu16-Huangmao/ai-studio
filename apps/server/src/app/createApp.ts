// @ai-radio/server — Express app factory
// ===================================================================

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import type { Server } from 'http';
import { env } from '../utils/env';
import { logger } from '../utils/logger';
import { requestLogger } from '../middleware/requestLogger';
import { errorHandler } from '../middleware/errorHandler';
import { mountRoutes } from '../routes';
import { WSManager } from '../websocket/wsManager';
import { setupGracefulShutdown } from '../utils/gracefulShutdown';

export interface AppInstance {
  app: express.Application;
  server: Server;
  wsManager: WSManager;
  listen(port: number): void;
}

export function createApp(): AppInstance {
  const app = express();
  const server = createServer(app);
  const wsManager = new WSManager();

  // ========== Global Middleware ==========

  // CORS
  app.use(
    cors({
      origin: env.RADIO_CLIENT_ORIGIN,
      credentials: true,
    }),
  );

  // Body parsing
  app.use(express.json({ limit: '1mb' }));

  // Request logging
  app.use(requestLogger);

  // ========== Routes ==========
  app.use(mountRoutes());

  // ========== Error Handler (must be last) ==========
  app.use(errorHandler);

  // ========== WebSocket ==========
  wsManager.attach(server);

  // ========== Graceful Shutdown ==========
  setupGracefulShutdown(server, wsManager);

  const listen = (port: number): void => {
    server.listen(port, () => {
      logger.info(`🚀 AI Radio server started at http://localhost:${port}`);
      logger.info(`📡 WebSocket at ws://localhost:${port}/ws`);
      logger.info(`📊 Health: http://localhost:${port}/api/health`);

      if (env.NODE_ENV === 'development') {
        logger.info('🛠️  Running in development mode');
      }
    });
  };

  return { app, server, wsManager, listen };
}
