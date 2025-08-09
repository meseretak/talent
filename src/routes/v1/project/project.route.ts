import express from 'express';
import { projectController } from '../../../controllers/v1';
import auth from '../../../middlewares/auth';
import validate from '../../../middlewares/validate';
import { freelancerValidation } from '../../../validations';
import projectValidation from '../../../validations/project.validation';

const router = express.Router();

router
  .route('/')
  .post(
    // auth('project'),
    validate(projectValidation.createProject),
    projectController.createProject,
  )
  .get(
    // auth('project'),
    validate(projectValidation.getAllProjects),
    projectController.getAllProjects,
  );

router.get(
  '/my-projects',
  auth('project'), // Assuming authentication is needed
  // validate(projectValidation.getMyProjects), // Assuming validation schema exists
  projectController.getMyProjects,
);

router.get(
  '/assigned-projects',
  auth('project'), // Assuming authentication is needed
  validate(projectValidation.getAssignedProjects),
  projectController.getAssignedProjects,
);

router.route('/:id').get(
  // auth('project'),
  validate(projectValidation.getProject),
  projectController.getProject,
);

router.route('/:id/status').patch(
  // auth('project'),
  validate(projectValidation.updateProjectStatus),
  projectController.updateProjectStatus,
);

router.route('/search').get(
  // auth('project'),
  validate(projectValidation.searchProjects),
  projectController.searchProjects,
);

router.route('/:id/freelancers').post(
  // auth('freelancerData'),
  validate(freelancerValidation.addTeamMembers),
  projectController.addProjectMembers,
);

router.route('/:id/project-manager').post(
  // auth('project'),
  validate(projectValidation.assignProjectManager),
  projectController.assignProjectManager,
);

router.route('/:id/activities').get(
  // auth('project'),
  validate(projectValidation.getProject),
  projectController.getProjectActivities,
);

export default router;
