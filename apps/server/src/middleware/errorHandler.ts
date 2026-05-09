// @ai-radio/server — Global error handling middleware
// ===================================================================

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

/**
 * 全局错误处理中间件（必须在路由之后注册）
 *
 * 统一拦截所有抛出的错误，返回标准 JSON 格式:
 *   { success: false, error: { code, message } }
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Known application error
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, code: err.code }, err.message);
    } else {
      logger.warn({ err, code: err.code }, err.message);
    }

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Zod validation error (unhandled)
  if (err.name === 'ZodError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
      },
    });
    return;
  }

  // Unknown error
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
