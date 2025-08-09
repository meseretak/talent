import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { MilestoneService } from '../../../services/project/milestone.service';
import auditService from '../../../services/user/audit.service';
import { AuditActionType } from '../../../types/audit';
import { User } from '../../../types/user';
import ApiError from '../../../utils/ApiError';
import catchAsync from '../../../utils/catchAsync';

const milestoneService = new MilestoneService();

/**
 * Create a new milestone
 * @route POST /v1/projects/:projectId/milestones
 */
const createMilestone = catchAsync(async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);
  const userDetail = req.user as User;

  const milestone = await milestoneService.createMilestone({
    ...req.body,
    projectId,
  });

  // Log the action
  await auditService.logAction({
    userId: userDetail.id,
    action: AuditActionType.CREATE,
    entityType: 'milestone',
    entityId: milestone.id,
    details: `Created milestone "${milestone.name}" for project ID: ${projectId}`,
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    data: milestone,
  });
});

/**
 * Get milestone by ID
 * @route GET /v1/milestones/:id
 */
const getMilestoneById = catchAsync(async (req: Request, res: Response) => {
  const milestoneId = parseInt(req.params.id);
  const milestone = await milestoneService.getMilestoneById(milestoneId);

  if (!milestone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Milestone not found');
  }

  res.status(httpStatus.OK).json({
    success: true,
    data: milestone,
  });
});

/**
 * Update milestone
 * @route PATCH /v1/milestones/:id
 */
const updateMilestone = catchAsync(async (req: Request, res: Response) => {
  const milestoneId = parseInt(req.params.id);
  const userDetail = req.user as User;

  // Check if milestone exists
  const existingMilestone = await milestoneService.getMilestoneById(milestoneId);
  if (!existingMilestone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Milestone not found');
  }

  const updatedMilestone = await milestoneService.updateMilestone(milestoneId, req.body);

  // Log the action
  await auditService.logAction({
    userId: userDetail.id,
    action: AuditActionType.UPDATE,
    entityType: 'milestone',
    entityId: milestoneId,
    details: `Updated milestone ID: ${milestoneId}`,
  });

  res.status(httpStatus.OK).json({
    success: true,
    data: updatedMilestone,
  });
});

/**
 * Delete milestone
 * @route DELETE /v1/milestones/:id
 */
const deleteMilestone = catchAsync(async (req: Request, res: Response) => {
  const milestoneId = parseInt(req.params.id);
  const userDetail = req.user as User;

  // Check if milestone exists
  const existingMilestone = await milestoneService.getMilestoneById(milestoneId);
  if (!existingMilestone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Milestone not found');
  }

  await milestoneService.deleteMilestone(milestoneId);

  // Log the action
  await auditService.logAction({
    userId: userDetail.id,
    action: AuditActionType.DELETE,
    entityType: 'milestone',
    entityId: milestoneId,
    details: `Deleted milestone ID: ${milestoneId}`,
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Milestone deleted successfully',
  });
});

/**
 * List milestones for a project
 * @route GET /v1/projects/:projectId/milestones
 */
const listMilestones = catchAsync(async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);

  const milestones = await milestoneService.listMilestones(projectId);

  res.status(httpStatus.OK).json({
    success: true,
    data: milestones,
  });
});

/**
 * Get milestone progress
 * @route GET /v1/milestones/:id/progress
 */
const getMilestoneProgress = catchAsync(async (req: Request, res: Response) => {
  const milestoneId = parseInt(req.params.id);

  const progress = await milestoneService.getMilestoneProgress(milestoneId);

  if (!progress) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Milestone not found');
  }

  res.status(httpStatus.OK).json({
    success: true,
    data: progress,
  });
});

/**
 * Add task to milestone
 * @route POST /v1/milestones/:id/tasks/:taskId
 */
const addTaskToMilestone = catchAsync(async (req: Request, res: Response) => {
  const milestoneId = parseInt(req.params.id);
  const taskId = parseInt(req.params.taskId);
  const userDetail = req.user as User;

  const updatedTask = await milestoneService.addTaskToMilestone(milestoneId, taskId);

  // Log the action
  await auditService.logAction({
    userId: userDetail.id,
    action: AuditActionType.UPDATE,
    entityType: 'milestone',
    entityId: milestoneId,
    details: `Added task ID: ${taskId} to milestone ID: ${milestoneId}`,
  });

  res.status(httpStatus.OK).json({
    success: true,
    data: updatedTask,
  });
});

/**
 * Remove task from milestone
 * @route DELETE /v1/milestones/tasks/:taskId
 */
const removeTaskFromMilestone = catchAsync(async (req: Request, res: Response) => {
  const taskId = parseInt(req.params.taskId);
  const userDetail = req.user as User;

  const updatedTask = await milestoneService.removeTaskFromMilestone(taskId);

  // Log the action
  await auditService.logAction({
    userId: userDetail.id,
    action: AuditActionType.UPDATE,
    entityType: 'task',
    entityId: taskId,
    details: `Removed task ID: ${taskId} from milestone`,
  });

  res.status(httpStatus.OK).json({
    success: true,
    data: updatedTask,
  });
});

export default {
  createMilestone,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
  listMilestones,
  getMilestoneProgress,
  addTaskToMilestone,
  removeTaskFromMilestone,
};
