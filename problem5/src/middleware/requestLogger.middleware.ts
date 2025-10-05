import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { maskSensitiveData } from '../utils/helpers';

/**
 * Request/Response Logger Middleware
 * Logs all incoming requests and outgoing responses
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Log request
  logger.http('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id,
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data): Response {
    const duration = Date.now() - startTime;

    // Log response
    logger.http('Outgoing response', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: (req as any).user?.id,
    });

    // Call original send
    return originalSend.call(this, data);
  };

  next();
}

/**
 * Detailed request logger (includes body)
 * Use with caution - only in development or debugging
 */
export function detailedRequestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();

  // Mask sensitive fields from body
  const sanitizedBody = req.body ? maskSensitiveData(req.body) : undefined;

  logger.debug('Detailed request', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: sanitizedBody,
    headers: maskSensitiveData(req.headers as Record<string, unknown>),
    ip: req.ip,
  });

  // Capture response
  const originalJson = res.json;
  res.json = function (data): Response {
    const duration = Date.now() - startTime;

    logger.debug('Detailed response', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      response: data,
    });

    return originalJson.call(this, data);
  };

  next();
}

/**
 * Security event logger
 * Logs security-related events (failed auth, forbidden access, etc.)
 */
export function securityLogger(event: string, details: Record<string, unknown>): void {
  logger.warn(`Security event: ${event}`, details);
}
