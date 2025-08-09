import { PrismaClient } from '../../generated/prisma';
import httpStatus from 'http-status';
import prisma from '../../client';
import { Prisma, ProjectActivityType, TaskPriorityType, TaskStatus } from '../../generated/prisma';
import ApiError from '../../utils/ApiError';

const prismaClient = new PrismaClient();

export interface TaskSearchFilters {
  status?: TaskStatus[];
  assignedToId?: number[]; // Changed to array
  projectId?: number;
  startDate?: Date;
  endDate?: Date;
}

interface CreateTaskInput extends Omit<Prisma.TaskCreateInput, 'Project' | 'assignedTo'> {
  projectId: number;
  assignedToId?: number;
}

const createTask = async (data: CreateTaskInput) => {
  const { projectId, assignedToId, ...rest } = data;
  return prisma.task.create({
    data: {
      ...rest,
      Project: {
        connect: {
          id: projectId,
        },
      },
      ...(assignedToId && {
        assignedTo: {
          connect: {
            id: assignedToId,
          },
        },
      }),
    },
    include: {
      Project: true,
      assignedTo: true,
      subTasks: true,
      freelancer: true,
      projectManager: true,
      milestone: true,
      attachments: true,
    },
  });
};

const getTaskById = async (id: number) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      Project: true,
      assignedTo: true,
      subTasks: true,
      comments: true,
      freelancer: true,
      projectManager: true,
      milestone: true,
      attachments: true,
      timeLogs: true,
    },
  });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  return task;
};

const updateTaskStatus = async (id: number, status: TaskStatus, userId: number) => {
  const task = await getTaskById(id);

  return prisma.task.update({
    where: { id },
    data: {
      status,
      projectActivities: {
        create: {
          type: ProjectActivityType.UPDATED, // Changed to use correct enum value
          description: `Task status updated to ${status}`,
          userId: userId,
          projectId: task.projectId!,
        },
      },
    },
    include: {
      Project: true,
      assignedTo: true,
      subTasks: true,
    },
  });
};

const searchTasks = async (filters: TaskSearchFilters) => {
  const { status, assignedToId, projectId, startDate, endDate } = filters;

  const where: Prisma.TaskWhereInput = {};

  if (status && status.length > 0) {
    where.status = { in: status };
  }

  if (assignedToId && assignedToId.length > 0) {
    where.assignedToId = {
      in: assignedToId,
    };
  }

  if (projectId) {
    where.projectId = projectId;
  }

  if (startDate || endDate) {
    where.dueDate = {};
    if (startDate) where.dueDate.gte = startDate;
    if (endDate) where.dueDate.lte = endDate;
  }

  return prisma.task.findMany({
    where,
    include: {
      Project: true,
      assignedTo: true,
      subTasks: true,
      freelancer: true,
      projectManager: true,
    },
    orderBy: {
      dueDate: 'desc',
    },
  });
};

const getProjectTasks = async (projectId: number) => {
  const where: Prisma.TaskWhereInput = {
    projectId,
  };

  return prisma.task.findMany({
    where,
    include: {
      Project: true,
      assignedTo: true,
    },
  });
};

const getAllProjectTasks = async (projectId: number) => {
  return prisma.task.findMany({
    where: {
      projectId,
    },
    include: {
      Project: true,
      assignedTo: true,
      subTasks: true,
      comments: true,
      freelancer: true,
      projectManager: true,
      milestone: true,
      attachments: true,
      timeLogs: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const assignTask = async (id: number, assigneeIds: number[]) => {
  const task = await getTaskById(id);

  return prisma.task.update({
    where: { id },
    data: {
      assignedToId: {
        set: assigneeIds[0], // Set to first assignee since the schema expects a single number
      },
    },
    include: {
      Project: true,
      assignedTo: true,
      subTasks: true,
    },
  });
};

const updateTaskPriority = async (id: number, priority: TaskPriorityType) => {
  const task = await getTaskById(id);

  return prisma.task.update({
    where: { id },
    data: {
      priority,
    },
    include: {
      Project: true,
      assignedTo: true,
    },
  });
};

const getTaskTimeLogs = async (taskId: number) => {
  return prisma.jobTimer.findMany({
    where: {
      taskId,
    },
  });
};

const addTaskComment = async (taskId: number, userId: number, content: string) => {
  return prisma.comment.create({
    data: {
      content: content,
      task: {
        connect: { id: taskId },
      },
      author: {
        connect: { id: userId },
      },
    },
    include: {
      task: true,
      author: true,
    },
  });
};

const startTaskTimer = async (taskId: number, userId: number) => {
  const activeTimer = await prisma.jobTimer.findFirst({
    where: {
      taskId,
      userId,
      status: 'ACTIVE',
    },
  });

  if (activeTimer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'There is already an active timer for this task');
  }

  return prisma.jobTimer.create({
    data: {
      task: {
        connect: { id: taskId },
      },
      user: {
        connect: { id: userId },
      },
      startTime: new Date(),
      status: 'ACTIVE',
    },
  });
};

const stopTaskTimer = async (taskId: number, userId: number) => {
  const activeTimer = await prisma.jobTimer.findFirst({
    where: {
      taskId,
      userId,
      status: 'ACTIVE',
    },
  });

  if (!activeTimer) {
    throw new ApiError(404, 'No active timer found for this task');
  }

  const endTime = new Date();
  const startTime = activeTimer.startTime;
  const durationInMs = endTime.getTime() - startTime.getTime();
  const durationInMinutes = Math.floor(durationInMs / (1000 * 60));

  return prisma.jobTimer.update({
    where: { id: activeTimer.id },
    data: {
      endTime,
      status: 'COMPLETED',
      duration: durationInMinutes,
    },
  });
};

export default {
  createTask,
  getTaskById,
  updateTaskStatus,
  searchTasks,
  getProjectTasks,
  getAllProjectTasks,
  assignTask,
  updateTaskPriority,
  getTaskTimeLogs,
  addTaskComment,
  startTaskTimer,
  stopTaskTimer,
};
