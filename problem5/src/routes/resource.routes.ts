import { Router } from 'express';
import {
  createResource,
  listResources,
  getResource,
  updateResource,
  deleteResource,
  getResourceStats,
} from '../controllers/resource.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireUserOrAdmin } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createResourceLimiter } from '../middleware/rateLimiter.middleware';
import {
  createResourceSchema,
  updateResourceSchema,
  resourceIdSchema,
  listResourcesSchema,
} from '../validators/resource.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: Resource management
 */

// All routes require authentication
router.use(authenticate);
router.use(requireUserOrAdmin);

// Resource CRUD operations
router.post(
  '/',
  createResourceLimiter,
  validate(createResourceSchema),
  createResource
);

router.get('/', validate(listResourcesSchema), listResources);

router.get('/stats', getResourceStats);

router.get('/:id', validate(resourceIdSchema), getResource);

router.put(
  '/:id',
  validate(resourceIdSchema),
  validate(updateResourceSchema),
  updateResource
);

router.delete('/:id', validate(resourceIdSchema), deleteResource);

export default router;
