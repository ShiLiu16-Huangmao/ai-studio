// @ai-radio/server — Chat controller
// ===================================================================

import type { Request, Response, NextFunction } from 'express';
import { ChatSendInputSchema } from '@ai-radio/shared';
import { chatService } from '../services/chat.service';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';

export const chatController = {
  /**
   * POST /api/chat
   *
   * Body: { conversationId?: string, text: string }
   */
  async send(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Zod validate input
      const parsed = ChatSendInputSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.badRequest('Invalid chat input');
      }

      const { text, conversationId } = parsed.data;

      logger.info({ text, conversationId }, 'Chat message received');

      // Process through mock chat service
      const result = await chatService.handleMessage(
        text,
        conversationId,
      );

      res.json({
        success: true,
        data: {
          text: result.text,
          action: result.action,
          track: result.track,
          mood: result.mood,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
