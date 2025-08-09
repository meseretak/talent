import { Request, Response } from 'express';
import httpStatus from 'http-status';
import logger from '../../../config/logger';
import * as scheduleService from '../../../services/user/schedule.service';
import catchAsync from '../../../utils/catchAsync';

const createGuestSchedule = catchAsync(async (req: Request, res: Response) => {
  try {
    const schedule = await scheduleService.createGuestSchedule(req.body);
    logger.info('Guest schedule created successfully', { scheduleId: schedule.id });
    res.status(httpStatus.CREATED).send(schedule);
  } catch (error: any) {
    logger.error('Failed to create guest schedule', {
      error: error.message,
      requestBody: req.body,
      stack: error.stack,
    });
    throw error;
  }
});

const getGuestScheduleById = catchAsync(async (req: Request, res: Response) => {
  const schedule = await scheduleService.getGuestScheduleById(req.params.id);
  if (!schedule) {
    res.status(httpStatus.NOT_FOUND).send({ message: 'Schedule not found' });
    return;
  }
  res.send(schedule);
});

const getGuestSchedulesByEmail = catchAsync(async (req: Request, res: Response) => {
  const schedules = await scheduleService.getGuestSchedulesByEmail(req.params.email);
  res.send(schedules);
});

const updateGuestSchedule = catchAsync(async (req: Request, res: Response) => {
  const schedule = await scheduleService.updateGuestSchedule(req.params.id, req.body);
  res.send(schedule);
});

const cancelGuestSchedule = catchAsync(async (req: Request, res: Response) => {
  const schedule = await scheduleService.cancelGuestSchedule(req.params.id);
  res.send(schedule);
});

const deleteGuestSchedule = catchAsync(async (req: Request, res: Response) => {
  const schedule = await scheduleService.deleteGuestSchedule(req.params.id);
  res.send(schedule);
});

const getUpcomingSchedules = catchAsync(async (_req: Request, res: Response) => {
  const schedules = await scheduleService.getUpcomingSchedules();
  res.send(schedules);
});

const confirmGuestSchedule = catchAsync(async (req: Request, res: Response) => {
  const schedule = await scheduleService.confirmGuestSchedule(req.params.id);
  res.send(schedule);
});

const completeGuestSchedule = catchAsync(async (req: Request, res: Response) => {
  const schedule = await scheduleService.completeGuestSchedule(req.params.id);
  res.send(schedule);
});

const updateReminderStatus = catchAsync(async (req: Request, res: Response) => {
  const schedule = await scheduleService.updateReminderStatus(req.params.id);
  res.send(schedule);
});

export default {
  createGuestSchedule,
  getGuestScheduleById,
  getGuestSchedulesByEmail,
  updateGuestSchedule,
  cancelGuestSchedule,
  deleteGuestSchedule,
  getUpcomingSchedules,
  confirmGuestSchedule,
  completeGuestSchedule,
  updateReminderStatus,
};
