import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ProjectActivityType } from '../../../generated/prisma';
import { ActivityService } from '../../../services/project/activity.service';
import catchAsync from '../../../utils/catchAsync';

const activityService = new ActivityService();

export class ActivityController {
  getActivityById = catchAsync(async (req: Request, res: Response) => {
    const activity = await activityService.getActivityById(Number(req.params.id));
    if (!activity) {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Activity not found' });
      return;
    }
    res.json(activity);
  });

  getProjectActivities = catchAsync(async (req: Request, res: Response) => {
    const projectId = Number(req.params.projectId);
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const activities = await activityService.getProjectActivities(projectId, page, limit);
    res.json(activities);
  });

  getUserActivities = catchAsync(async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const activities = await activityService.getUserActivities(userId, page, limit);
    res.json(activities);
  });

  getTaskActivities = catchAsync(async (req: Request, res: Response) => {
    const taskId = Number(req.params.taskId);
    const activities = await activityService.getTaskActivities(taskId);
    res.json(activities);
  });

  logTaskActivity = catchAsync(async (req: Request, res: Response) => {
    const { type, description, userId, taskId } = req.body;

    const activity = await activityService.logTaskActivity(
      type as ProjectActivityType,
      description,
      Number(userId),
      Number(taskId),
    );

    if (!activity) {
      res
        .status(httpStatus.NOT_FOUND)
        .json({ message: 'Task not found or not associated with a project' });
      return;
    }

    res.status(httpStatus.CREATED).json(activity);
  });

  logProjectActivity = catchAsync(async (req: Request, res: Response) => {
    const { type, description, userId, projectId } = req.body;

    const activity = await activityService.logProjectActivity(
      type as ProjectActivityType,
      description,
      Number(userId),
      Number(projectId),
    );

    res.status(httpStatus.CREATED).json(activity);
  });
}

export default new ActivityController();
