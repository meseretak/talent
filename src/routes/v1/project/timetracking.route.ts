import express from 'express';
import timetrackingController from '../../../controllers/v1/project/timetracking.controller';
import auth from '../../../middlewares/auth';
import validate from '../../../middlewares/validate';
import timetrackingValidation from '../../../validations/timetracking.validation';

const router = express.Router();

// All routes require authentication
// router.use(auth());

// Timer management routes
router.post(
  '/start',
  validate(timetrackingValidation.startTimer),
  timetrackingController.startTimer,
);

router.post('/stop', validate(timetrackingValidation.stopTimer), timetrackingController.stopTimer);

router.get(
  '/active',
  validate(timetrackingValidation.getActiveTimer),
  timetrackingController.getActiveTimer,
);

// Time logs retrieval routes
router.get(
  '/user/:userId',
  validate(timetrackingValidation.getUserTimeLogs),
  timetrackingController.getUserTimeLogs,
);

router.get(
  '/task/:taskId',
  validate(timetrackingValidation.getTaskTimeLogs),
  timetrackingController.getTaskTimeLogs,
);

router.get(
  '/project/:projectId',
  validate(timetrackingValidation.getProjectTimeLogs),
  timetrackingController.getProjectTimeLogs,
);

router.get(
  '/freelancer/:freelancerId',
  validate(timetrackingValidation.getFreelancerTimeLogs),
  timetrackingController.getFreelancerTimeLogs,
);

export default router;
