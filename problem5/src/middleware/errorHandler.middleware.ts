import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import { logger } from '../config/logger';
import { ErrorResponse } from '../models/types';

/**
 * Global Error Handler Middleware
 * Catches all errors and formats them for consistent API responses
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Log error details
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  // Handle known application errors
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      status: 'error',
      message: error.message,
    };

    if (error.errors && error.errors.length > 0) {
      response.errors = error.errors;
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      response.stack = error.stack;
    }

    res.status(error.statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = handlePrismaError(error);
    res.status(prismaError.statusCode).json({
      status: 'error',
      message: prismaError.message,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid data provided',
    });
    return;
  }

  // Handle unknown errors
  const isDevelopment = process.env.NODE_ENV === 'development';
  res.status(500).json({
    status: 'error',
    message: isDevelopment ? error.message : 'Internal server error',
    ...(isDevelopment && { stack: error.stack }),
  });
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
  statusCode: number;
  message: string;
} {
  switch (error.code) {
    case 'P2002': // Unique constraint violation
      return {
        statusCode: 409,
        message: `Duplicate value for ${(error.meta?.target as string[])?.join(', ') || 'field'}`,
      };

    case 'P2025': // Record not found
      return {
        statusCode: 404,
        message: 'Resource not found',
      };

    case 'P2003': // Foreign key constraint violation
      return {
        statusCode: 400,
        message: 'Invalid reference to related resource',
      };

    case 'P2014': // Relation violation
      return {
        statusCode: 400,
        message: 'Operation would violate data integrity',
      };

    default:
      logger.error('Unhandled Prisma error', { code: error.code, meta: error.meta });
      return {
        statusCode: 500,
        message: 'Database error occurred',
      };
  }
}

/**
 * Handle 404 Not Found errors
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.path} not found`,
  });
}

/**
 * Async handler wrapper to catch promise rejections
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
