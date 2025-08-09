import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { resourceController } from '../../controllers/v1';
import { User } from '../../generated/prisma';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import resourceValidation from '../../validations/resource.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: Resource management and operations
 */

// Update your AuthenticatedRequest type or use the existing one
type AuthenticatedRequest = Request & { user: User };

// Add this type assertion function at the top of the file
const assertAuthHandler = (
  handler: (
    req: Request & { user: User },
    res: Response,
    next: NextFunction,
  ) => Promise<void> | void,
): RequestHandler => {
  return async (req, res, next) => {
    try {
      // Cast to unknown first to avoid TypeScript error
      await handler(req as unknown as Request & { user: User }, res, next);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * @swagger
 * /resources:
 *   post:
 *     summary: Create a new resource
 *     description: Users can create and upload new resources.
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - url
 *               - projectId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [VIDEO, DESIGN, AUDIO, DOCUMENT, CODE, OTHER]
 *               url:
 *                 type: string
 *               projectId:
 *                 type: integer
 *               taskId:
 *                 type: integer
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 */
router
  .route('/')
  .post(
    auth('resource'),
    validate(resourceValidation.createResource),
    assertAuthHandler(resourceController.createResource),
  );

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Get a resource by ID
 *     description: Get detailed resource information.
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
router
  .route('/:id')
  .get(validate(resourceValidation.getResource), assertAuthHandler(resourceController.getResource));

/**
 * @swagger
 * /resources/{id}/status:
 *   patch:
 *     summary: Update resource status
 *     description: Update the status of a resource.
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, ARCHIVED, DELETED]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
router
  .route('/:id/status')
  .patch(
    validate(resourceValidation.updateResourceStatus),
    assertAuthHandler(resourceController.updateResourceStatus),
  );

/**
 * @swagger
 * /resources/project/{projectId}:
 *   get:
 *     summary: Get project resources
 *     description: Get all resources for a specific project.
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Comma-separated resource types
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, ARCHIVED, DELETED]
 *         description: Resource status
 *       - in: query
 *         name: uploadedById
 *         schema:
 *           type: integer
 *         description: Uploader ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
router
  .route('/project/:projectId')
  .get(
    validate(resourceValidation.getProjectResources),
    assertAuthHandler(resourceController.getProjectResources),
  );

/**
 * @swagger
 * /resources/task/{taskId}:
 *   get:
 *     summary: Get task resources
 *     description: Get all resources for a specific task.
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Comma-separated resource types
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, ARCHIVED, DELETED]
 *         description: Resource status
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
router
  .route('/task/:taskId')
  .get(
    validate(resourceValidation.getTaskResources),
    assertAuthHandler(resourceController.getTaskResources),
  );

/**
 * @swagger
 * /resources/{id}/attach:
 *   post:
 *     summary: Attach resource to task
 *     description: Attach an existing resource to a task.
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *             properties:
 *               taskId:
 *                 type: integer
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
router
  .route('/:id/attach')
  .post(
    validate(resourceValidation.attachResourceToTask),
    assertAuthHandler(resourceController.attachResourceToTask),
  );

/**
 * @swagger
 * /resources/search:
 *   get:
 *     summary: Search resources
 *     description: Search and filter resources based on various criteria.
 *     tags: [Resources]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: integer
 *         description: Project ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Comma-separated resource types
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, ARCHIVED, DELETED]
 *         description: Resource status
 *       - in: query
 *         name: uploadedById
 *         schema:
 *           type: integer
 *         description: Uploader ID
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
router
  .route('/search')
  .get(
    validate(resourceValidation.searchResources),
    assertAuthHandler(resourceController.searchResources),
  );

/**
 * @swagger
 * /resources/{id}/download:
 *   get:
 *     summary: Get resource download URL
 *     description: Get a temporary download URL for a resource.
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 downloadUrl:
 *                   type: string
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
router
  .route('/:id/download')
  .get(
    validate(resourceValidation.getResource),
    assertAuthHandler(resourceController.downloadResource),
  );

export default router;
