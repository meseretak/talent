import express from 'express';
import meetingController from '../../../controllers/v1/project/meeting.controller';

const router = express.Router();

// Create a meeting
router.post('/', meetingController.createMeeting);

// List meetings (with optional filters)
router.get('/', meetingController.listMeetings);

// Get a meeting by ID
router.get('/:id', meetingController.getMeetingById);

// Update a meeting by ID
router.patch('/:id', meetingController.updateMeeting);

// Delete a meeting by ID
router.delete('/:id', meetingController.deleteMeeting);

// Update meeting status
router.patch('/:id/status', meetingController.updateMeetingStatus);

// Add notes to a meeting
router.post('/:id/notes', meetingController.addMeetingNotes);

// Add agenda to a meeting
router.post('/:id/agenda', meetingController.addMeetingAgenda);

// Send reminder for a meeting
router.post('/:id/reminder', meetingController.sendReminder);

// Get all meetings for a project (optionally only upcoming)
router.get('/project/:projectId', meetingController.getProjectMeetings);

// Get all meetings for a user (optionally only upcoming)
router.get('/user/:userId', meetingController.getUserMeetings);

export default router;
