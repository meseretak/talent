import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { TimeTrackingService } from '../../../services/project/timetracking.service';
import auditService from '../../../services/user/audit.service';
import { AuditActionType } from '../../../types/audit';
import { User } from '../../../types/user';
import catchAsync from '../../../utils/catchAsync';

const timeTrackingService = new TimeTrackingService();

/**
 * Start a timer for a task
 * @route POST /v1/time-tracking/start
 */
const startTimer = catchAsync(async (req: Request, res: Response) => {
  const userDetail = req.user as User;

  // If userId is not provided in the request, use the logged-in user's ID
  if (!req.body.userId) {
    req.body.userId = userDetail.id;
  }

  const timer = await timeTrackingService.startTimer(req.body);

  // Log the action
  await auditService.logAction({
    userId: userDetail.id,
    action: AuditActionType.CREATE,
    entityType: 'timer',
    entityId: timer.id,
    details: `Started timer for task ID: ${timer.taskId}`,
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    data: timer,
  });
});

/**
 * Stop a timer for a task
 * @route POST /v1/time-tracking/stop
 */
const stopTimer = catchAsync(async (req: Request, res: Response) => {
  const userDetail = req.user as User;

  // If userId is not provided in the request, use the logged-in user's ID
  if (!req.body.userId) {
    req.body.userId = userDetail.id;
  }

  const timeLog = await timeTrackingService.stopTimer(req.body);

  // Log the action
  await auditService.logAction({
    userId: userDetail.id,
    action: AuditActionType.CREATE,
    entityType: 'timeLog',
    entityId: timeLog.id,
    details: `Stopped timer for task ID: ${timeLog.taskId}`,
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    data: timeLog,
  });
});

/**
 * Get active timer for a user
 * @route GET /v1/time-tracking/active
 */
const getActiveTimer = catchAsync(async (req: Request, res: Response) => {
  const userDetail = req.user as User;
  const userId = parseInt(req.query.userId as string) || userDetail.id;

  const timer = await timeTrackingService.getActiveTimer(userId);

  res.status(httpStatus.OK).json({
    success: true,
    data: timer,
  });
});

/**
 * Get time logs for a user
 * @route GET /v1/time-tracking/user/:userId
 */
const getUserTimeLogs = catchAsync(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Extract filter parameters
  const { startDate, endDate, taskId, projectId } = req.query;
  const filter: any = {};

  if (startDate && endDate) {
    filter.startTime = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    };
  }

  if (taskId) {
    filter.taskId = parseInt(taskId as string);
  }

  if (projectId) {
    filter.projectId = parseInt(projectId as string);
  }

  const timeLogs = await timeTrackingService.getUserTimeLogs(userId, filter, page, limit);

  res.status(httpStatus.OK).json({
    success: true,
    data: timeLogs,
  });
});

/**
 * Get time logs for a task
 * @route GET /v1/time-tracking/task/:taskId
 */
const getTaskTimeLogs = catchAsync(async (req: Request, res: Response) => {
  const taskId = parseInt(req.params.taskId);

  const timeLogs = await timeTrackingService.getTaskTimeLogs(taskId);

  res.status(httpStatus.OK).json({
    success: true,
    data: timeLogs,
  });
});

/**
 * Get time logs for a project
 * @route GET /v1/time-tracking/project/:projectId
 */
const getProjectTimeLogs = catchAsync(async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);

  const timeLogs = await timeTrackingService.getProjectTimeLogs(projectId);

  res.status(httpStatus.OK).json({
    success: true,
    data: timeLogs,
  });
});

/**
 * Get time logs for a freelancer
 * @route GET /v1/time-tracking/freelancer/:freelancerId
 */
const getFreelancerTimeLogs = catchAsync(async (req: Request, res: Response) => {
  const freelancerId = parseInt(req.params.freelancerId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Extract filter parameters
  const { startDate, endDate, taskId, projectId } = req.query;
  const filter: any = {};

  if (startDate && endDate) {
    filter.startTime = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    };
  }

  if (taskId) {
    filter.taskId = parseInt(taskId as string);
  }

  if (projectId) {
    filter.projectId = parseInt(projectId as string);
  }

  const timeLogs = await timeTrackingService.getFreelancerTimeLogs(
    freelancerId,
    filter,
    page,
    limit,
  );

  res.status(httpStatus.OK).json({
    success: true,
    data: timeLogs,
  });
});

export default {
  startTimer,
  stopTimer,
  getActiveTimer,
  getUserTimeLogs,
  getTaskTimeLogs,
  getProjectTimeLogs,
  getFreelancerTimeLogs,
};
