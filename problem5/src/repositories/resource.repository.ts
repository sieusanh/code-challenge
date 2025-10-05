import { Resource, Prisma, Status } from '@prisma/client';
import { prisma } from '../config/database';
import { PaginationParams, ResourceFilters } from '../models/types';

/**
 * Resource Repository - Data access layer
 * Implements parameterized queries to prevent SQL injection
 */
export class ResourceRepository {
  /**
   * Find resource by ID
   */
  async findById(id: string): Promise<Resource | null> {
    return prisma.resource.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Create new resource
   */
  async create(data: Prisma.ResourceCreateInput): Promise<Resource> {
    return prisma.resource.create({
      data,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Update resource
   */
  async update(id: string, data: Prisma.ResourceUpdateInput): Promise<Resource> {
    return prisma.resource.update({
      where: { id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Delete resource
   */
  async delete(id: string): Promise<Resource> {
    return prisma.resource.delete({
      where: { id },
    });
  }

  /**
   * List resources with filters and pagination
   */
  async findMany(
    filters: ResourceFilters,
    pagination: PaginationParams
  ): Promise<{ resources: Resource[]; total: number }> {
    const where: Prisma.ResourceWhereInput = this.buildWhereClause(filters);

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      }),
      prisma.resource.count({ where }),
    ]);

    return { resources, total };
  }

  /**
   * Find resources by owner ID
   */
  async findByOwnerId(ownerId: string, pagination: PaginationParams): Promise<Resource[]> {
    return prisma.resource.findMany({
      where: { ownerId },
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Check if user owns resource
   */
  async isOwner(resourceId: string, userId: string): Promise<boolean> {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { ownerId: true },
    });
    return resource?.ownerId === userId;
  }

  /**
   * Count resources by owner
   */
  async countByOwner(ownerId: string): Promise<number> {
    return prisma.resource.count({
      where: { ownerId },
    });
  }

  /**
   * Build Prisma where clause from filters (prevents SQL injection via parameterized queries)
   */
  private buildWhereClause(filters: ResourceFilters): Prisma.ResourceWhereInput {
    const where: Prisma.ResourceWhereInput = {};

    if (filters.status) {
      where.status = filters.status as Status;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    if (filters.ownerId) {
      where.ownerId = filters.ownerId;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    return where;
  }
}

export const resourceRepository = new ResourceRepository();
