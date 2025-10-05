import { Response } from 'express';
import { AuthenticatedRequest } from '../models/types';
import { authService } from '../services/auth.service';
import { createResponse } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler.middleware';

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: User already exists
 *       422:
 *         description: Validation error
 */
export const register = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await authService.register(req.body);

    res.status(201).json(
      createResponse(
        'success',
        result,
        'User registered successfully'
      )
    );
  }
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with credentials
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
export const login = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await authService.login(req.body);

    res.status(200).json(
      createResponse(
        'success',
        result,
        'Login successful'
      )
    );
  }
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Not authenticated
 */
export const getCurrentUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    res.status(200).json(
      createResponse(
        'success',
        req.user,
        'User profile retrieved successfully'
      )
    );
  }
);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Invalid current password
 */
export const changePassword = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user!.id, currentPassword, newPassword);

    res.status(200).json(
      createResponse(
        'success',
        undefined,
        'Password changed successfully'
      )
    );
  }
);
