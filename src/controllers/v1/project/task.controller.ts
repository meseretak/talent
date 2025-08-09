import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { AuditActionType, TaskStatus, User } from '../../../generated/prisma';
import { auditService, taskService } from '../../../services';
import catchAsync from '../../../utils/catchAsync';

// Mock user ID for testing without authentication
const mockUserId = 1;

export class TaskController {
  createTask = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as User;
    const task = await taskService.createTask({
      ...req.body,
      assignedBy: {
        connect: { id: user.id },
      },
    });

    await auditService.logAction({
      userId: user.id,
      action: AuditActionType.CREATE,
      entityType: 'task',
      entityId: task.id,
      details: `Created task: ${task.title}`,
    });

    res.status(httpStatus.CREATED).json(task);
  });

  getTask = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as User;
    const task = await taskService.getTaskById(Number(req.params.id));

    await auditService.logAction({
      userId: user.id,
      action: AuditActionType.VIEW,
      entityType: 'task',
      entityId: task.id,
      details: `Viewed task: ${task.title}`,
    });

    res.json(task);
  });

  updateTaskStatus = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as User;
    const { status } = req.body;
    const taskId = Number(req.params.id);

    const task = await taskService.updateTaskStatus(taskId, status as TaskStatus, user.id);

    await auditService.logAction({
      userId: user.id,
      action: AuditActionType.UPDATE,
      entityType: 'task',
      entityId: task.id,
      details: `Updated task status to: ${status}`,
    });

    res.json(task);
  });

  searchTasks = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as User;
    const { status, assignedToId, assignedById, projectId, startDate, endDate } = req.query;

    const filters = {
      status: status ? ((status as string).split(',') as TaskStatus[]) : undefined,
      assignedToId: assignedToId ? (assignedToId as string).split(',').map(Number) : undefined,
      assignedById: assignedById ? Number(assignedById) : undefined,
      projectId: projectId ? Number(projectId) : undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const tasks = await taskService.searchTasks(filters);
    res.json(tasks);
  });

  getProjectTasks = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as User;
    const projectId = Number(req.params.projectId);
    const tasks = await taskService.getProjectTasks(projectId);
    res.json(tasks);
  });

  getAllProjectTasks = catchAsync(async (req: Request, res: Response) => {
    const projectId = Number(req.params.projectId);
    const tasks = await taskService.getAllProjectTasks(projectId);
    res.json(tasks);
  });

  assignTask = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as User;
    const { freelancerId } = req.body;
    const taskId = Number(req.params.id);

    const task = await taskService.assignTask(taskId, [Number(freelancerId)]); // Wrap in array

    await auditService.logAction({
      userId: user.id,
      action: AuditActionType.UPDATE,
      entityType: 'task',
      entityId: task.id,
      details: `Assigned task to user ID: ${freelancerId}`,
    });

    res.json(task);
  });

  updateTaskPriority = catchAsync(async (req: Request, res: Response) => {
    const { priority } = req.body;
    const taskId = Number(req.params.id);

    const task = await taskService.updateTaskPriority(taskId, priority);

    await auditService.logAction({
      userId: mockUserId,
      action: AuditActionType.UPDATE,
      entityType: 'task',
      entityId: task.id,
      details: `Updated task priority to: ${priority}`,
    });

    res.json(task);
  });

  getTaskTimeLogs = catchAsync(async (req: Request, res: Response) => {
    const taskId = Number(req.params.id);
    const timeLogs = await taskService.getTaskTimeLogs(taskId);
    res.json(timeLogs);
  });

  addTaskComment = catchAsync(async (req: Request, res: Response) => {
    const { content } = req.body;
    const taskId = Number(req.params.id);

    const comment = await taskService.addTaskComment(taskId, mockUserId, content);

    await auditService.logAction({
      userId: mockUserId,
      action: AuditActionType.CREATE,
      entityType: 'task_comment',
      entityId: comment.id,
      details: `Added comment to task ID: ${taskId}`,
    });

    res.status(httpStatus.CREATED).json(comment);
  });

  startTaskTimer = catchAsync(async (req: Request, res: Response) => {
    const taskId = Number(req.params.id);
    const timer = await taskService.startTaskTimer(taskId, mockUserId);
    res.json(timer);
  });

  stopTaskTimer = catchAsync(async (req: Request, res: Response) => {
    const taskId = Number(req.params.id);
    const timer = await taskService.stopTaskTimer(taskId, mockUserId);
    res.json(timer);
  });
}

export default new TaskController();
