// @ai-radio/server — Custom application error
// ===================================================================

/**
 * 应用级错误，携带 HTTP 状态码和可恢复标记
 */
export class AppError extends Error {
  /** HTTP 状态码 */
  public readonly statusCode: number;

  /** 错误码 (机器可读) */
  public readonly code: string;

  /** 是否可恢复 (true = 可重试, false = 需外部干预) */
  public readonly recoverable: boolean;

  /** 附加调试信息（不返回给客户端） */
  public readonly details: unknown;

  constructor(
    message: string,
    options: {
      statusCode?: number;
      code?: string;
      recoverable?: boolean;
      details?: unknown;
    } = {},
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? 'INTERNAL_ERROR';
    this.recoverable = options.recoverable ?? false;
    this.details = options.details ?? null;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /** 400 Bad Request */
  static badRequest(message: string, code = 'BAD_REQUEST'): AppError {
    return new AppError(message, { statusCode: 400, code, recoverable: true });
  }

  /** 404 Not Found */
  static notFound(message: string, code = 'NOT_FOUND'): AppError {
    return new AppError(message, { statusCode: 404, code, recoverable: true });
  }

  /** 500 Internal Error */
  static internal(message: string, code = 'INTERNAL_ERROR'): AppError {
    return new AppError(message, { statusCode: 500, code, recoverable: false });
  }
}
