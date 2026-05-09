// @ai-radio/server — State controller
// ===================================================================

import type { Request, Response, NextFunction } from 'express';
import { djService } from '../services/dj.service';
import { playerService } from '../services/player.service';

export const stateController = {
  /**
   * GET /api/state
   *
   * Returns current server state snapshot:
   *   { dj, player, weather, uptime }
   */
  getState(_req: Request, res: Response, _next: NextFunction): void {
    res.json({
      success: true,
      data: {
        dj: {
          ...djService.getState(),
          status: djService.getStatus(),
        },
        player: playerService.getState(),
        weather: {
          temperature: 18,
          condition: '多云',
          humidity: 65,
          windLevel: 2,
          city: '上海',
          updatedAt: new Date().toISOString(),
        },
        uptime: process.uptime(),
      },
    });
  },
};
