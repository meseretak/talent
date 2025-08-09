import express from 'express';
import milestoneController from '../../../controllers/v1/project/milestone.controller';
import auth from '../../../middlewares/auth';
import validate from '../../../middlewares/validate';
import milestoneValidation from '../../../validations/milestone.validation';

const router = express.Router();

// All routes require authentication
// router.use(auth());

// Routes specific to a project
router
  .route('/projects/:projectId')
  .post(validate(milestoneValidation.createMilestone), milestoneController.createMilestone)
  .get(validate(milestoneValidation.listMilestones), milestoneController.listMilestones);

// Routes for specific milestones
router
  .route('/milestones/:id')
  .get(validate(milestoneValidation.getMilestone), milestoneController.getMilestoneById)
  .patch(validate(milestoneValidation.updateMilestone), milestoneController.updateMilestone)
  .delete(validate(milestoneValidation.deleteMilestone), milestoneController.deleteMilestone);

// Get milestone progress
router.get(
  '/progress/:id',
  validate(milestoneValidation.getMilestoneProgress),
  milestoneController.getMilestoneProgress,
);

// Add task to milestone
router.post(
  '/milestones/:id/tasks/:taskId',
  validate(milestoneValidation.addTaskToMilestone),
  milestoneController.addTaskToMilestone,
);

// Remove task from milestone
router.delete(
  '/milestones/tasks/:taskId',
  validate(milestoneValidation.removeTaskFromMilestone),
  milestoneController.removeTaskFromMilestone,
);

export default router;
