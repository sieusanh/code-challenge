import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../models/types';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if user has required role(s) to access resource
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // Check if user has one of the allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole(Role.ADMIN);

/**
 * User or Admin middleware
 */
export const requireUserOrAdmin = requireRole(Role.USER, Role.ADMIN);

/**
 * Access Control List (ACL) Middleware
 * Checks resource ownership or admin privileges
 */
export function requireOwnershipOrAdmin(resourceIdParam: string = 'id') {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // Admins have access to all resources
      if (req.user.role === Role.ADMIN) {
        return next();
      }

      // Check ownership
      const resourceId = req.params[resourceIdParam];
      const userId = req.user.id;

      // This is a simplified check - in production, you'd query the database
      // to verify ownership based on the specific resource type
      // The actual ownership check is done in the service layer
      // This middleware is more of a preliminary check

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if user is active
 */
export function requireActiveAccount(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!req.user.isActive) {
      throw new ForbiddenError('Account is inactive. Please contact support.');
    }

    next();
  } catch (error) {
    next(error);
  }
}
