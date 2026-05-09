// @ai-radio/server — Route registration
// ===================================================================

import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { stateController } from '../controllers/state.controller';

export function mountRoutes(): Router {
  const router = Router();

  // Chat
  router.post('/api/chat', chatController.send);

  // State
  router.get('/api/state', stateController.getState);

  // Health check (inline — no controller needed)
  router.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        uptime: process.uptime(),
        version: '0.0.0',
      },
    });
  });

  return router;
}
