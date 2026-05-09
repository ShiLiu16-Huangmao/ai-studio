// @ai-radio/server — Zod validation middleware
// ===================================================================

import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

/**
 * Body 校验中间件工厂
 *
 * @example
 *   router.post('/api/chat', validateBody(ChatSendInputSchema), chatController.send)
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        AppError.badRequest('Validation failed', 'VALIDATION_ERROR'),
      );
    }
    req.body = result.data;
    next();
  };
}

/**
 * Query 参数校验中间件工厂
 *
 * @example
 *   router.get('/api/items', validateQuery(PaginationQuerySchema), ...)
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(
        AppError.badRequest('Invalid query parameters', 'VALIDATION_ERROR'),
      );
    }
    req.query = result.data as Record<string, string>;
    next();
  };
}
