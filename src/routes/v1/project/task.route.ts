import express from 'express';
import { taskController } from '../../../controllers/v1';
import validate from '../../../middlewares/validate';
import taskValidation from '../../../validations/task.validation';

const router = express.Router();

router
  .route('/')
  .post(validate(taskValidation.createTask), (req, res, next) =>
    taskController.createTask(req, res, next),
  );

router
  .route('/:id')
  .get(validate(taskValidation.getTask), (req, res, next) =>
    taskController.getTask(req, res, next),
  );

router
  .route('/:id/status')
  .patch(validate(taskValidation.updateTaskStatus), (req, res, next) =>
    taskController.updateTaskStatus(req, res, next),
  );

router
  .route('/project/:projectId')
  .get(validate(taskValidation.getProjectTasks), (req, res, next) =>
    taskController.getProjectTasks(req, res, next),
  );

router
  .route('/project/:projectId/all')
  .get(validate(taskValidation.getProjectTasks), (req, res, next) =>
    taskController.getAllProjectTasks(req, res, next),
  );

router
  .route('/:id/assign')
  .post(validate(taskValidation.assignTask), (req, res, next) =>
    taskController.assignTask(req, res, next),
  );

router
  .route('/:id/comments')
  .post(validate(taskValidation.addTaskComment), (req, res, next) =>
    taskController.addTaskComment(req, res, next),
  );

router
  .route('/:id/timer')
  .post(validate(taskValidation.taskTimer), (req, res, next) =>
    taskController.startTaskTimer(req, res, next),
  )
  .delete(validate(taskValidation.taskTimer), (req, res, next) =>
    taskController.stopTaskTimer(req, res, next),
  );

router
  .route('/:id/time-logs')
  .get(validate(taskValidation.taskTimer), (req, res, next) =>
    taskController.getTaskTimeLogs(req, res, next),
  );

export default router;
