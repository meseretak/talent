import express from 'express';
import deliverableController from '../../../controllers/v1/project/deliverable.controller';
import auth from '../../../middlewares/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Deliverables
 *   description: Deliverable management and operations
 */

/**
 * @swagger
 * /deliverables:
 *   post:
 *     summary: Create a new deliverable
 *     description: Create a new deliverable with the provided details.
 *     tags: [Deliverables]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - projectId
 *               - taskId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [DRAFT, IN_PROGRESS, REVIEW, APPROVED, REJECTED]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *               feedbackRequired:
 *                 type: boolean
 *               projectId:
 *                 type: integer
 *               taskId:
 *                 type: integer
 *               assignees:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Deliverable'
 */
router.route('/').post(auth('deliverables'), deliverableController.createDeliverable);

/**
 * @swagger
 * /deliverables/{id}:
 *   get:
 *     summary: Get a deliverable by ID
 *     description: Retrieve detailed deliverable information.
 *     tags: [Deliverables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Deliverable ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Deliverable'
 *       "404":
 *         description: Deliverable not found
 *   patch:
 *     summary: Update a deliverable
 *     description: Update deliverable details.
 *     tags: [Deliverables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Deliverable ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [DRAFT, IN_PROGRESS, REVIEW, APPROVED, REJECTED]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *               assignees:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Deliverable'
 *       "404":
 *         description: Deliverable not found
 *   delete:
 *     summary: Delete a deliverable
 *     description: Delete a deliverable by ID.
 *     tags: [Deliverables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Deliverable ID
 *     responses:
 *       "204":
 *         description: No content
 */
router
  .route('/:id')
  .get(auth('deliverables'), deliverableController.getDeliverableById)
  .patch(auth('deliverables'), deliverableController.updateDeliverable)
  .delete(auth('deliverables'), deliverableController.deleteDeliverable);

/**
 * @swagger
 * /deliverables/{id}/review:
 *   post:
 *     summary: Submit deliverable for review
 *     description: Change deliverable status to review.
 *     tags: [Deliverables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Deliverable ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Deliverable'
 */
router.route('/:id/review').post(auth('deliverables'), deliverableController.submitForReview);

/**
 * @swagger
 * /deliverables/{id}/approve:
 *   post:
 *     summary: Approve deliverable
 *     description: Approve a deliverable and mark it as completed.
 *     tags: [Deliverables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Deliverable ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Deliverable'
 */
router.route('/:id/approve').post(auth('deliverables'), deliverableController.approveDeliverable);

/**
 * @swagger
 * /deliverables/{id}/revision:
 *   post:
 *     summary: Request revision
 *     description: Request revision for a deliverable.
 *     tags: [Deliverables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Deliverable ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - revisionNotes
 *             properties:
 *               revisionNotes:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Deliverable'
 */
router.route('/:id/revision').post(auth('deliverables'), deliverableController.requestRevision);

/**
 * @swagger
 * /deliverables/{id}/feedback:
 *   post:
 *     summary: Add feedback
 *     description: Add feedback to a deliverable.
 *     tags: [Deliverables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Deliverable ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - feedback
 *             properties:
 *               userId:
 *                 type: integer
 *               feedback:
 *                 type: string
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliverableFeedback'
 */
router.route('/:id/feedback').post(auth('deliverables'), deliverableController.addFeedback);

/**
 * @swagger
 * /deliverables/{id}/comment:
 *   post:
 *     summary: Add comment
 *     description: Add a comment to a deliverable.
 *     tags: [Deliverables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Deliverable ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - content
 *             properties:
 *               userId:
 *                 type: integer
 *               content:
 *                 type: string
 *               parentId:
 *                 type: integer
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliverableComment'
 */
router.route('/:id/comment').post(auth('deliverables'), deliverableController.addComment);

/**
 * @swagger
 * /deliverables/{id}/metrics:
 *   patch:
 *     summary: Update metrics
 *     description: Update deliverable metrics.
 *     tags: [Deliverables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Deliverable ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - metrics
 *             properties:
 *               metrics:
 *                 type: object
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Deliverable'
 */
router.route('/:id/metrics').patch(auth('deliverables'), deliverableController.updateMetrics);

/**
 * @swagger
 * /deliverables/{id}/feedback/read:
 *   patch:
 *     summary: Mark feedback as read
 *     description: Mark deliverable feedback as read by PM or client.
 *     tags: [Deliverables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Deliverable ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isPM:
 *                 type: boolean
 *               isClient:
 *                 type: boolean
 *     responses:
 *       "200":
 *         description: OK
 */
router
  .route('/:id/feedback/read')
  .patch(auth('deliverables'), deliverableController.markFeedbackAsRead);

export default router;
