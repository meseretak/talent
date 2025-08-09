import express from 'express';
import { pmController } from '../../controllers/v1';
import validate from '../../middlewares/validate';
import pmValidation from '../../validations/pm.validation';

const router = express.Router();

router
  .route('/')
  .post(validate(pmValidation.createProjectManager), pmController.setProjectManager)
  .get(validate(pmValidation.getProjectManagers), pmController.getProjectManagers);

router
  .route('/:id')
  .get(validate(pmValidation.getProjectManager), pmController.getProjectManagerById)
  .patch(validate(pmValidation.updateProjectManager), pmController.updateProjectManagerinfo)
  .delete(validate(pmValidation.deleteProjectManager), pmController.deleteProjectManager);

router.get('/user/:id', pmController.getProjectManagerByUserID);
// project - with - project manager
router.post(
  '/assign-project/:id',
  validate(pmValidation.assignProject),
  pmController.setAssignProject,
);
router.post(
  '/assign-task/:id',
  validate(pmValidation.assignTask),
  pmController.assignTaskToProjectManager,
);

router.get('/my-project', pmController.getMyProject);
router.get(
  '/managed-projects/:id',
  validate(pmValidation.getManagedProjects),
  pmController.getManagedProject,
);
router.get(
  '/managed-tasks/:id',
  validate(pmValidation.getManagedTasks),
  pmController.getManagedTask,
);
router.get(
  '/user/is-pm/:id',
  validate(pmValidation.isProjectManager),
  pmController.getIsProjectManager,
);
router.get(
  '/:id/performance',
  validate(pmValidation.getPerformanceMetrics),
  pmController.getPerformanceMatrics,
);

export default router;
