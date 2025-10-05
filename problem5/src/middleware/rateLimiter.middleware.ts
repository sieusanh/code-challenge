import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../config/logger';

/**
 * General API rate limiter
 * Prevents abuse by limiting requests per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent'),
    });
    res.status(429).json({
      status: 'error',
      message: 'Too many requests, please try again later',
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      email: req.body.email,
    });
    res.status(429).json({
      status: 'error',
      message: 'Too many authentication attempts, please try again later',
    });
  },
});

/**
 * Create resource rate limiter
 * Prevents spam resource creation
 */
export const createResourceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 creations per hour
  message: 'Too many resources created, please try again later',
  handler: (req: Request, res: Response) => {
    logger.warn('Create resource rate limit exceeded', {
      ip: req.ip,
      userId: (req as any).user?.id,
    });
    res.status(429).json({
      status: 'error',
      message: 'Too many resources created, please try again later',
    });
  },
});

/**
 * Flexible rate limiter factory
 */
export function createRateLimiter(
  windowMs: number,
  max: number,
  message: string = 'Too many requests'
) {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
  });
}
