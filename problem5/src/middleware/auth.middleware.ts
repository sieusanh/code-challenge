import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../models/types';
import { authService } from '../services/auth.service';
import { UnauthorizedError } from '../utils/errors';
import { userRepository } from '../repositories/user.repository';

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = await authService.verifyToken(token);

    // Fetch user from database to ensure they still exist and are active
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if no token provided
 */
export async function optionalAuthenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = await authService.verifyToken(token);

    const user = await userRepository.findById(decoded.userId);
    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      };
    }

    next();
  } catch {
    // Ignore errors for optional authentication
    next();
  }
}

/**
 * API Key authentication middleware (optional alternative to JWT)
 */
export async function authenticateApiKey(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedError('API key required');
    }

    // In production, validate API key against database
    // This is a simplified example
    const validApiKey = process.env.API_KEY;
    if (!validApiKey || apiKey !== validApiKey) {
      throw new UnauthorizedError('Invalid API key');
    }

    next();
  } catch (error) {
    next(error);
  }
}
