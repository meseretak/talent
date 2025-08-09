import express from 'express';
import kanbanController from '../../../controllers/v1/project/kanban.controller';
import auth from '../../../middlewares/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Kanban
 *   description: Kanban board management and operations
 */

/**
 * @swagger
 * /kanban/boards:
 *   post:
 *     summary: Create a new kanban board
 *     description: Create a new kanban board with default columns.
 *     tags: [Kanban]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               projectId:
 *                 type: integer
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KanbanBoard'
 */
router.route('/boards').post(auth('kanban'), kanbanController.createKanbanBoard);

/**
 * @swagger
 * /kanban/boards/{id}:
 *   get:
 *     summary: Get a kanban board by ID
 *     description: Retrieve kanban board details including columns and tasks.
 *     tags: [Kanban]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kanban board ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KanbanBoard'
 *       "404":
 *         description: Kanban board not found
 *   patch:
 *     summary: Update a kanban board
 *     description: Update kanban board details.
 *     tags: [Kanban]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kanban board ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KanbanBoard'
 *   delete:
 *     summary: Delete a kanban board
 *     description: Delete a kanban board by ID.
 *     tags: [Kanban]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kanban board ID
 *     responses:
 *       "204":
 *         description: No content
 */
router
  .route('/boards/:id')
  .get(auth('kanban'), kanbanController.getKanbanBoardById)
  .patch(auth('kanban'), kanbanController.updateKanbanBoard)
  .delete(auth('kanban'), kanbanController.deleteKanbanBoard);

/**
 * @swagger
 * /kanban/project/{projectId}/board:
 *   get:
 *     summary: Get project's kanban board
 *     description: Retrieve the kanban board associated with a project.
 *     tags: [Kanban]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KanbanBoard'
 *       "404":
 *         description: Kanban board not found for this project
 */
router
  .route('/project/:projectId/board')
  .get(auth('kanban'), kanbanController.getKanbanBoardByProject);

/**
 * @swagger
 * /kanban/boards/{boardId}/columns:
 *   post:
 *     summary: Add a column to board
 *     description: Create a new column in the kanban board.
 *     tags: [Kanban]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kanban board ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - order
 *             properties:
 *               name:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KanbanColumn'
 */
router.route('/boards/:boardId/columns').post(auth('kanban'), kanbanController.addColumnToBoard);

/**
 * @swagger
 * /kanban/boards/{boardId}/columns/order:
 *   patch:
 *     summary: Update column order
 *     description: Reorder columns in the kanban board.
 *     tags: [Kanban]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kanban board ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - columns
 *             properties:
 *               columns:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - order
 *                   properties:
 *                     id:
 *                       type: integer
 *                     order:
 *                       type: integer
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/KanbanColumn'
 */
router
  .route('/boards/:boardId/columns/order')
  .patch(auth('kanban'), kanbanController.updateColumnOrder);

/**
 * @swagger
 * /kanban/tasks/{taskId}/move:
 *   post:
 *     summary: Move task to column
 *     description: Move a task to a different column.
 *     tags: [Kanban]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - columnId
 *             properties:
 *               columnId:
 *                 type: integer
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 */
router.route('/tasks/:taskId/move').post(auth('kanban'), kanbanController.moveTaskToColumn);

/**
 * @swagger
 * /kanban/columns/{columnId}:
 *   patch:
 *     summary: Rename column
 *     description: Update the name of a kanban column.
 *     tags: [Kanban]
 *     parameters:
 *       - in: path
 *         name: columnId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Column ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KanbanColumn'
 *   delete:
 *     summary: Delete column
 *     description: Delete a column and move its tasks to another column.
 *     tags: [Kanban]
 *     parameters:
 *       - in: path
 *         name: columnId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Column ID
 *     responses:
 *       "204":
 *         description: No content
 *       "404":
 *         description: Column not found
 */
router
  .route('/columns/:columnId')
  .patch(auth('kanban'), kanbanController.renameColumn)
  .delete(auth('kanban'), kanbanController.deleteColumn);

export default router;
