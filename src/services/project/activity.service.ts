import { PrismaClient, ProjectActivityType } from '../../generated/prisma';

const prisma = new PrismaClient();

export class ActivityService {
  async createActivity(
    type: ProjectActivityType,
    description: string,
    userId: number,
    projectId: number,
    taskId?: number,
  ) {
    return prisma.projectActivity.create({
      data: {
        type,
        description,
        user: { connect: { id: userId } },
        project: { connect: { id: projectId } },
        ...(taskId && { task: { connect: { id: taskId } } }),
        createdAt: new Date(),
      },
      include: {
        user: true,
        project: true,
        task: true,
      },
    });
  }

  async getActivityById(id: number) {
    return prisma.projectActivity.findUnique({
      where: { id },
      include: {
        user: true,
        project: true,
        task: true,
        relatedTasks: true,
      },
    });
  }

  async getProjectActivities(projectId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return prisma.projectActivity.findMany({
      where: { projectId },
      skip,
      take: limit,
      include: {
        user: true,
        task: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUserActivities(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return prisma.projectActivity.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        project: true,
        task: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getTaskActivities(taskId: number) {
    return prisma.projectActivity.findMany({
      where: { taskId },
      include: {
        user: true,
        project: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async logTaskActivity(
    type: ProjectActivityType,
    description: string,
    userId: number,
    taskId: number,
  ) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });

    if (!task || task.projectId === null) return null;

    return this.createActivity(type, description, userId, task.projectId, taskId);
  }

  async logProjectActivity(
    type: ProjectActivityType,
    description: string,
    userId: number,
    projectId: number,
  ) {
    return this.createActivity(type, description, userId, projectId);
  }
}
