import { Response } from 'express';
import { AuthenticatedRequest } from '../models/types';
import { resourceService } from '../services/resource.service';
import {
  createResponse,
  getPaginationParams,
  calculateTotalPages,
  parseArray,
} from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler.middleware';

/**
 * @swagger
 * /resources:
 *   post:
 *     summary: Create a new resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Resource'
 *     responses:
 *       201:
 *         description: Resource created successfully
 *       401:
 *         description: Not authenticated
 *       422:
 *         description: Validation error
 */
export const createResource = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const resource = await resourceService.create(req.body, req.user!.id);

    res.status(201).json(
      createResponse(
        'success',
        resource,
        'Resource created successfully'
      )
    );
  }
);

/**
 * @swagger
 * /resources:
 *   get:
 *     summary: List all resources with filters
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, ARCHIVED]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated tags
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of resources
 *       401:
 *         description: Not authenticated
 */
export const listResources = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { page = 1, limit = 10, status, category, tags, search, startDate, endDate } = req.query as any;

    const pagination = getPaginationParams(Number(page), Number(limit));

    const filters = {
      status,
      category,
      tags: parseArray(tags),
      search,
      startDate,
      endDate,
    };

    const { resources, total } = await resourceService.list(
      filters,
      pagination,
      req.user!.id,
      req.user!.role
    );

    const totalPages = calculateTotalPages(total, pagination.limit);

    res.status(200).json(
      createResponse('success', resources, 'Resources retrieved successfully', {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      })
    );
  }
);

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Get resource by ID
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Resource details
 *       404:
 *         description: Resource not found
 *       403:
 *         description: Access forbidden
 */
export const getResource = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const resource = await resourceService.getById(id, req.user!.id, req.user!.role);

    res.status(200).json(
      createResponse(
        'success',
        resource,
        'Resource retrieved successfully'
      )
    );
  }
);

/**
 * @swagger
 * /resources/{id}:
 *   put:
 *     summary: Update resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Resource'
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *       404:
 *         description: Resource not found
 *       403:
 *         description: Access forbidden
 */
export const updateResource = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const resource = await resourceService.update(
      id,
      req.body,
      req.user!.id,
      req.user!.role
    );

    res.status(200).json(
      createResponse(
        'success',
        resource,
        'Resource updated successfully'
      )
    );
  }
);

/**
 * @swagger
 * /resources/{id}:
 *   delete:
 *     summary: Delete resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       404:
 *         description: Resource not found
 *       403:
 *         description: Access forbidden
 */
export const deleteResource = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    await resourceService.delete(id, req.user!.id, req.user!.role);

    res.status(200).json(
      createResponse(
        'success',
        undefined,
        'Resource deleted successfully'
      )
    );
  }
);

/**
 * @swagger
 * /resources/stats:
 *   get:
 *     summary: Get user resource statistics
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resource statistics
 */
export const getResourceStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const stats = await resourceService.getUserStats(req.user!.id);

    res.status(200).json(
      createResponse(
        'success',
        stats,
        'Statistics retrieved successfully'
      )
    );
  }
);
