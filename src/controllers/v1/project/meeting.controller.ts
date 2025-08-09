import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { MeetingStatus } from '../../../generated/prisma';
import { MeetingService } from '../../../services/project/meeting.service';
import catchAsync from '../../../utils/catchAsync';

const meetingService = new MeetingService();

export class MeetingController {
  createMeeting = catchAsync(async (req: Request, res: Response) => {
    const meeting = await meetingService.createMeeting(req.body);
    res.status(httpStatus.CREATED).json(meeting);
  });

  getMeetingById = catchAsync(async (req: Request, res: Response) => {
    const meeting = await meetingService.getMeetingById(Number(req.params.id));
    if (!meeting) {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Meeting not found' });
      return;
    }
    res.json(meeting);
  });

  updateMeeting = catchAsync(async (req: Request, res: Response) => {
    const meeting = await meetingService.updateMeeting(Number(req.params.id), req.body);
    if (!meeting) {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Meeting not found' });
      return;
    }
    res.json(meeting);
  });

  deleteMeeting = catchAsync(async (req: Request, res: Response) => {
    await meetingService.deleteMeeting(Number(req.params.id));
    res.status(httpStatus.NO_CONTENT).send();
  });

  listMeetings = catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, ...filter } = req.query;
    const meetings = await meetingService.listMeetings(filter, Number(page), Number(limit));
    res.json(meetings);
  });

  updateMeetingStatus = catchAsync(async (req: Request, res: Response) => {
    const { status } = req.body;
    const meeting = await meetingService.updateMeetingStatus(
      Number(req.params.id),
      status as MeetingStatus,
    );
    res.json(meeting);
  });

  addMeetingNotes = catchAsync(async (req: Request, res: Response) => {
    const { notes } = req.body;
    const meeting = await meetingService.addMeetingNotes(Number(req.params.id), notes);
    res.json(meeting);
  });

  addMeetingAgenda = catchAsync(async (req: Request, res: Response) => {
    const { agenda } = req.body;
    const meeting = await meetingService.addMeetingAgenda(Number(req.params.id), agenda);
    res.json(meeting);
  });

  sendReminder = catchAsync(async (req: Request, res: Response) => {
    const meeting = await meetingService.sendReminder(Number(req.params.id));
    res.json(meeting);
  });

  getProjectMeetings = catchAsync(async (req: Request, res: Response) => {
    const { upcomingOnly = true } = req.query;
    const meetings = await meetingService.getProjectMeetings(
      Number(req.params.projectId),
      upcomingOnly === 'true',
    );
    res.json(meetings);
  });

  getUserMeetings = catchAsync(async (req: Request, res: Response) => {
    const { upcomingOnly = true } = req.query;
    const meetings = await meetingService.getUserMeetings(
      Number(req.params.userId),
      upcomingOnly === 'true',
    );
    res.json(meetings);
  });
}

export default new MeetingController();
