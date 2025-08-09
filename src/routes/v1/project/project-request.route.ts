import express from 'express';
import { projectRequestController } from '../../../controllers/v1';
import auth from '../../../middlewares/auth';
import validate from '../../../middlewares/validate';
import projectRequestValidation from '../../../validations/project-request.validation';

const router = express.Router();

// Resource routes
router.route('/resources').post(
  // auth('resource'),
  validate(projectRequestValidation.createResource),
  projectRequestController.createResource,
);

// Add the new route for getting my resources
router.get(
  '/resources/my-resources',
  // auth('resource'), // Assuming authentication is needed
  // validate(projectRequestValidation.getMyResources), // Assuming validation is needed and defined
  projectRequestController.getMyResources,
);

router
  .route('/resources/:id')
  .get(
    // auth('resource'),
    validate(projectRequestValidation.getResource),
    projectRequestController.getResource,
  )
  .patch(
    // auth('resource'),
    validate(projectRequestValidation.updateResource),
    projectRequestController.updateResource,
  );

router.route('/resources/:id/documents').post(
  // auth('resource'),
  validate(projectRequestValidation.addDocumentToResource),
  projectRequestController.addDocumentToResource,
);

// Project Request routes
router
  .route('/')
  .post(
    // auth('projectRequest'),
    validate(projectRequestValidation.createProjectRequest),
    projectRequestController.createProjectRequest,
  )
  .get(
    // auth('projectRequest'),
    validate(projectRequestValidation.getAllProjectRequests),
    projectRequestController.getAllProjectRequests,
  );

// Specific routes that must come before /:id routes
router.get(
  '/my-requests',
  auth('projectRequest'),
  validate(projectRequestValidation.getMyProjectRequests),
  projectRequestController.getMyProjectRequests,
);

router.get(
  '/client',
  auth('projectRequest'),
  validate(projectRequestValidation.getClientProjectRequests),
  projectRequestController.getClientProjectRequests,
);

// Project Request by ID routes
router.route('/:id').get(
  // auth('projectRequest'),
  validate(projectRequestValidation.getProjectRequest),
  projectRequestController.getProjectRequest,
);

router.route('/:id/status').patch(
  // auth('projectRequest'),
  validate(projectRequestValidation.updateProjectRequestStatus),
  projectRequestController.updateProjectRequestStatus,
);

router.route('/:id/link-project').post(
  // auth('projectRequest'),
  validate(projectRequestValidation.linkProjectRequestToProject),
  projectRequestController.linkProjectRequestToProject,
);

export default router;
