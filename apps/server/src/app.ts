// @ai-radio/server — Express app factory

import type { Server } from 'http';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

export interface AppInstance {
  app: express.Application;
  server: Server;
  listen(port: number, callback?: () => void): Server;
}

export async function createApp(): Promise<AppInstance> {
  const app = express();
  const server = createServer(app);

  // Core middleware
  app.use(
    cors({
      origin: process.env.RADIO_CLIENT_ORIGIN ?? 'http://localhost:5173',
      credentials: true,
    }),
  );
  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      version: '0.0.0',
      services: {
        claude: false,
        fishAudio: false,
        netease: false,
      },
    });
  });

  // WebSocket will be attached here in Phase 2
  // import { createWSServer } from './ws/wsServer';
  // createWSServer(server);

  // Routes will be mounted here
  // import { mountRoutes } from './routes';
  // mountRoutes(app);

  const listen = (port: number, callback?: () => void) => {
    return server.listen(port, callback);
  };

  return { app, server, listen };
}
