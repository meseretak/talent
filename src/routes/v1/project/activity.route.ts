import express from 'express';
import activityController from '../../../controllers/v1/project/activity.controller';
import auth from '../../../middlewares/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Project activity management and tracking
 */

/**
 * @swagger
 * /activities/{id}:
 *   get:
 *     summary: Get an activity by ID
 *     description: Retrieve activity details by ID.
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Activity ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       "404":
 *         description: Activity not found
 */
router.route('/:id').get(auth('activity'), activityController.getActivityById);

/**
 * @swagger
 * /activities/project/{projectId}:
 *   get:
 *     summary: Get project activities
 *     description: Retrieve all activities for a specific project with pagination.
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 */
router.route('/project/:projectId').get(auth('activity'), activityController.getProjectActivities);

/**
 * @swagger
 * /activities/user/{userId}:
 *   get:
 *     summary: Get user activities
 *     description: Retrieve all activities for a specific user with pagination.
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 */
router.route('/user/:userId').get(auth('activity'), activityController.getUserActivities);

/**
 * @swagger
 * /activities/task/{taskId}:
 *   get:
 *     summary: Get task activities
 *     description: Retrieve all activities for a specific task.
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 */
router.route('/task/:taskId').get(auth('activity'), activityController.getTaskActivities);

/**
 * @swagger
 * /activities/task:
 *   post:
 *     summary: Log a task activity
 *     description: Create a new activity log for a task.
 *     tags: [Activities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - description
 *               - userId
 *               - taskId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [CREATED, UPDATED, DELETED, COMPLETED, COMMENT_ADDED]
 *               description:
 *                 type: string
 *               userId:
 *                 type: integer
 *               taskId:
 *                 type: integer
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       "404":
 *         description: Task not found or not associated with a project
 */
router.route('/task').post(auth('activity'), activityController.logTaskActivity);

/**
 * @swagger
 * /activities/project:
 *   post:
 *     summary: Log a project activity
 *     description: Create a new activity log for a project.
 *     tags: [Activities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - description
 *               - userId
 *               - projectId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [CREATED, UPDATED, DELETED, COMPLETED, COMMENT_ADDED]
 *               description:
 *                 type: string
 *               userId:
 *                 type: integer
 *               projectId:
 *                 type: integer
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 */
router.route('/project').post(auth('activity'), activityController.logProjectActivity);

export default router;
