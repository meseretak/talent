import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { User } from '../../../generated/prisma';
import pmService from '../../../services/user/pm.service';
import catchAsync from '../../../utils/catchAsync';

const setProjectManager = catchAsync(async (req: Request, res: Response) => {
  const projectM = await pmService.createProjectManager(req.body);
  res.status(httpStatus.CREATED).send(projectM);
});

const getProjectManagerById = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const projectManager = await pmService.getProjectManager(id);
  if (!projectManager) {
    res.status(httpStatus.NOT_FOUND).send({ message: 'Project Manager not found' });
    return;
  }
  res.send(projectManager);
});

const getProjectManagers = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, search, status } = req.query;

  const params = {
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
    search: search as string | undefined,
    status: status as string | undefined,
  };

  const result = await pmService.getAllProjectManagers(params);
  res.send(result);
});

const getProjectManagerByUserID = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const projectManager = await pmService.getProjectManagerByUserId(id);
  res.send(projectManager);
});

const updateProjectManagerinfo = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const projectManager = await pmService.updateProjectManager(id, req.body);
  res.send(projectManager);
});

const deleteProjectManager = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const projectManager = await pmService.deleteProjectManager(id);
  res.send(projectManager);
});

const setAssignProject = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const projectId = Number(req.body.projectId);
  const assignedProject = await pmService.assignProject(id, projectId);
  res.send(assignedProject);
});

const getManagedProject = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const managedProjects = await pmService.getManagedProjects(id);
  res.send(managedProjects);
});

const getMyProject = catchAsync(async (req: Request, res: Response) => {
  const userDetail = req.user as User;
  if (!req.user || !userDetail) {
    res.status(httpStatus.UNAUTHORIZED).send({ message: 'User not found or unauthorized' });
    return;
  }

  const id = userDetail.id;
  const managedProjects = await pmService.getManagedProjects(id);
  res.send(managedProjects);
});

const getManagedTask = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const managedProjects = await pmService.getManagedTasks(id);
  res.send(managedProjects);
});
const assignTaskToProjectManager = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const taskId = Number(req.body.taskId);
  const assignTask = await pmService.assignTask(id, taskId);
  res.send(assignTask);
});

const getIsProjectManager = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const metrix = await pmService.isProjectManager(id);
  res.send(metrix);
});

const getPerformanceMatrics = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const metrix = await pmService.getPerformanceMetrics(id);
  res.send(metrix);
});

export default {
  setProjectManager,
  getProjectManagerById,
  getProjectManagers,
  getMyProject,
  getProjectManagerByUserID,
  updateProjectManagerinfo,
  deleteProjectManager,
  setAssignProject,
  getManagedProject,
  getManagedTask,
  assignTaskToProjectManager,
  getIsProjectManager,
  getPerformanceMatrics,
};
