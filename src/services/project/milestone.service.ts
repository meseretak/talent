import { PrismaClient, TaskStatus } from '../../generated/prisma';
import { CreateMilestoneDto, UpdateMilestoneDto } from '../../types/milestone';

const prisma = new PrismaClient();

export class MilestoneService {
  async createMilestone(createMilestoneDto: CreateMilestoneDto) {
    return prisma.milestone.create({
      data: {
        name: createMilestoneDto.name,
        description: createMilestoneDto.description,
        dueDate: createMilestoneDto.dueDate,
        status: TaskStatus.IN_PROGRESS,
        project: { connect: { id: createMilestoneDto.projectId } },
      },
      include: {
        project: true,
        tasks: true,
      },
    });
  }

  async getMilestoneById(id: number) {
    return prisma.milestone.findUnique({
      where: { id },
      include: {
        project: true,
        tasks: {
          include: {
            assignedTo: true,
          },
        },
      },
    });
  }

  async updateMilestone(id: number, dto: UpdateMilestoneDto) {
    const data: any = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate;
    if (dto.status !== undefined) data.status = dto.status as TaskStatus;

    return prisma.milestone.update({
      where: { id },
      data,
      include: {
        project: true,
        tasks: true,
      },
    });
  }

  async deleteMilestone(id: number) {
    return prisma.milestone.delete({
      where: { id },
    });
  }

  async listMilestones(projectId: number) {
    return prisma.milestone.findMany({
      where: { projectId },
      include: {
        tasks: {
          include: {
            assignedTo: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  async getMilestoneProgress(milestoneId: number) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        tasks: true,
      },
    });

    if (!milestone) return null;

    const totalTasks = milestone.tasks.length;
    const completedTasks = milestone.tasks.filter(
      (task) => task.status === TaskStatus.COMPLETED,
    ).length;

    return {
      totalTasks,
      completedTasks,
      progress: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    };
  }

  async addTaskToMilestone(milestoneId: number, taskId: number) {
    return prisma.task.update({
      where: { id: taskId },
      data: {
        milestone: { connect: { id: milestoneId } },
      },
    });
  }

  async removeTaskFromMilestone(taskId: number) {
    return prisma.task.update({
      where: { id: taskId },
      data: {
        milestone: { disconnect: true },
      },
    });
  }
}
