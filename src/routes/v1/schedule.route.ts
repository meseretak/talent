import express from 'express';
import { scheduleController } from '../../controllers/v1';

const router = express.Router();

router
  .route('/')
  .post(scheduleController.createGuestSchedule)
  .get(scheduleController.getUpcomingSchedules);

router
  .route('/:id')
  .get(scheduleController.getGuestScheduleById)
  .patch(scheduleController.updateGuestSchedule)
  .delete(scheduleController.deleteGuestSchedule);

router.get('/email/:email', scheduleController.getGuestSchedulesByEmail);
router.post('/:id/cancel', scheduleController.cancelGuestSchedule); // sorry email template needed
router.post('/:id/confirm', scheduleController.confirmGuestSchedule); // email template needed
router.post('/:id/complete', scheduleController.completeGuestSchedule); // thanks email template needed
router.post('/:id/reminder', scheduleController.updateReminderStatus); // v2 functionality

export default router;
