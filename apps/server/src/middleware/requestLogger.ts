// @ai-radio/server — HTTP request logging middleware
// ===================================================================

import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * 记录每个 HTTP 请求的方法、路径、状态码和耗时
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[level](
      {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
      },
      `${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`,
    );
  });

  next();
}
