import { Role } from '@prisma/client';
import { resourceRepository } from '../repositories/resource.repository';
import {
  CreateResourceDto,
  UpdateResourceDto,
  ResourceFilters,
  PaginationParams,
} from '../models/types';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { logger } from '../config/logger';
import { sanitizeObject } from '../utils/helpers';

/**
 * Resource Service - Business logic layer
 * Implements authorization checks and business rules
 */
export class ResourceService {
  /**
   * Create new resource
   */
  async create(data: CreateResourceDto, userId: string) {
    // Sanitize input to prevent XSS
    const sanitizedData = sanitizeObject(data);

    const resource = await resourceRepository.create({
      ...sanitizedData,
      owner: {
        connect: { id: userId },
      },
    });

    logger.info('Resource created', { resourceId: resource.id, userId });
    return resource;
  }

  /**
   * Get resource by ID
   */
  async getById(id: string, userId: string, userRole: Role) {
    const resource = await resourceRepository.findById(id);

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    // Authorization check: users can only see their own resources unless admin
    if (userRole !== Role.ADMIN && resource.ownerId !== userId) {
      throw new ForbiddenError('You do not have permission to view this resource');
    }

    return resource;
  }

  /**
   * List resources with filters and pagination
   */
  async list(
    filters: ResourceFilters,
    pagination: PaginationParams,
    userId: string,
    userRole: Role
  ) {
    // Non-admin users can only see their own resources
    if (userRole !== Role.ADMIN) {
      filters.ownerId = userId;
    }

    const { resources, total } = await resourceRepository.findMany(filters, pagination);

    return { resources, total };
  }

  /**
   * Update resource
   */
  async update(
    id: string,
    data: UpdateResourceDto,
    userId: string,
    userRole: Role
  ) {
    const resource = await resourceRepository.findById(id);

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    // Authorization check: users can only update their own resources unless admin
    if (userRole !== Role.ADMIN && resource.ownerId !== userId) {
      throw new ForbiddenError('You do not have permission to update this resource');
    }

    // Sanitize input to prevent XSS
    const sanitizedData = sanitizeObject(data);

    const updatedResource = await resourceRepository.update(id, sanitizedData);

    logger.info('Resource updated', { resourceId: id, userId });
    return updatedResource;
  }

  /**
   * Delete resource
   */
  async delete(id: string, userId: string, userRole: Role) {
    const resource = await resourceRepository.findById(id);

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    // Authorization check: users can only delete their own resources unless admin
    if (userRole !== Role.ADMIN && resource.ownerId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this resource');
    }

    await resourceRepository.delete(id);

    logger.info('Resource deleted', { resourceId: id, userId });
  }

  /**
   * Get user's resource statistics
   */
  async getUserStats(userId: string) {
    const total = await resourceRepository.countByOwner(userId);

    return {
      total,
      userId,
    };
  }
}

export const resourceService = new ResourceService();
