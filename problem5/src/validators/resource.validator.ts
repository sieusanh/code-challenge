import { z } from 'zod';
import { Status } from '@prisma/client';

export const createResourceSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().max(1000).optional(),
    category: z.string().max(100).optional(),
    tags: z.array(z.string().max(50)).max(10, 'Maximum 10 tags allowed').optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export const updateResourceSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200).optional(),
    description: z.string().max(1000).optional().nullable(),
    status: z.nativeEnum(Status).optional(),
    category: z.string().max(100).optional().nullable(),
    tags: z.array(z.string().max(50)).max(10, 'Maximum 10 tags allowed').optional(),
    metadata: z.record(z.unknown()).optional().nullable(),
  }),
});

export const resourceIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid resource ID format'),
  }),
});

export const listResourcesSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, 'Page must be positive'),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
    status: z.nativeEnum(Status).optional(),
    category: z.string().max(100).optional(),
    tags: z.string().optional(), // Comma-separated string
    search: z.string().max(200).optional(),
    startDate: z
      .string()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    endDate: z
      .string()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
  }),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>['body'];
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>['body'];
export type ResourceIdInput = z.infer<typeof resourceIdSchema>['params'];
export type ListResourcesInput = z.infer<typeof listResourcesSchema>['query'];
