// @ai-radio/server — Graceful shutdown handler
// ===================================================================

import type { Server } from 'http';
import type { WSManager } from '../websocket/wsManager';
import { logger } from './logger';

/**
 * 注册优雅关闭处理
 *
 * 监听 SIGTERM / SIGINT，按序:
 * 1. 停止接收新连接
 * 2. 通知所有 WS 客户端
 * 3. 关闭 HTTP server
 * 4. 退出进程
 */
export function setupGracefulShutdown(
  httpServer: Server,
  wsManager: WSManager,
  options: { timeout?: number } = {},
): void {
  const timeout = options.timeout ?? 5000;

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'Graceful shutdown initiated');

    // Force exit after timeout
    const forceExit = setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, timeout);
    forceExit.unref();

    // 1. Broadcast shutdown to WS clients
    wsManager.broadcast('system:event', {
      event: 'shutdown',
      message: 'Server is shutting down',
    });

    // 2. Close all WS connections
    wsManager.closeAll(1001, 'Server shutting down');

    // 3. Stop accepting new HTTP connections
    await new Promise<void>((resolve) => {
      httpServer.close(() => {
        logger.info('HTTP server closed');
        resolve();
      });
    });

    clearTimeout(forceExit);
    logger.info('Graceful shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
