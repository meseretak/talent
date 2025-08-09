import { JobTimerStatus, PrismaClient } from '../../generated/prisma';
import { StartTimerDto, StopTimerDto } from '../../types/timetracking';

const prisma = new PrismaClient();

export class TimeTrackingService {
  async startTimer(startTimerDto: StartTimerDto) {
    // Check if there's an active timer for this user
    const activeTimer = await prisma.jobTimer.findFirst({
      where: {
        userId: startTimerDto.userId,
        status: 'ACTIVE',
      },
    });

    if (activeTimer) {
      throw new Error('User already has an active timer');
    }

    return prisma.jobTimer.create({
      data: {
        startTime: new Date(),
        task: { connect: { id: startTimerDto.taskId } },
        user: { connect: { id: startTimerDto.userId } },
        status: 'ACTIVE',
      },
      include: {
        task: true,
        user: true,
      },
    });
  }

  async stopTimer(stopTimerDto: StopTimerDto) {
    // Find the active timer
    const activeTimer = await prisma.jobTimer.findFirst({
      where: {
        userId: stopTimerDto.userId,
        taskId: stopTimerDto.taskId,
        status: 'ACTIVE',
      },
    });

    if (!activeTimer) {
      throw new Error('No active timer found');
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeTimer.startTime.getTime()) / 1000); // in seconds

    // Update the job timer
    await prisma.jobTimer.update({
      where: { id: activeTimer.id },
      data: {
        endTime,
        status: JobTimerStatus.COMPLETED,
        duration,
      },
    });

    // Create a time log entry
    const timeLog = await prisma.timeLog.create({
      data: {
        startTime: activeTimer.startTime,
        endTime,
        task: { connect: { id: stopTimerDto.taskId } },
        user: { connect: { id: stopTimerDto.userId } },
        freelancer: { connect: { id: stopTimerDto.freelancerId } },
        ...(stopTimerDto.projectId && {
          project: { connect: { id: stopTimerDto.projectId } },
        }),
      },
      include: {
        task: true,
        user: true,
        freelancer: true,
        project: true,
      },
    });

    // Update the task's actual hours
    const task = await prisma.task.findUnique({
      where: { id: stopTimerDto.taskId },
    });

    if (task) {
      const hoursToAdd = duration / 3600; // convert seconds to hours
      const newActualHours = (task.actualHours || 0) + hoursToAdd;

      await prisma.task.update({
        where: { id: stopTimerDto.taskId },
        data: {
          actualHours: newActualHours,
        },
      });
    }

    return timeLog;
  }

  async getActiveTimer(userId: number) {
    return prisma.jobTimer.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        task: true,
      },
    });
  }

  async getUserTimeLogs(userId: number, filter: any = {}, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return prisma.timeLog.findMany({
      where: {
        userId,
        ...filter,
      },
      skip,
      take: limit,
      include: {
        task: true,
        project: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }

  async getTaskTimeLogs(taskId: number) {
    return prisma.timeLog.findMany({
      where: { taskId },
      include: {
        user: true,
        freelancer: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }

  async getProjectTimeLogs(projectId: number) {
    return prisma.timeLog.findMany({
      where: { projectId },
      include: {
        task: true,
        user: true,
        freelancer: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }

  async getFreelancerTimeLogs(
    freelancerId: number,
    filter: any = {},
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    return prisma.timeLog.findMany({
      where: {
        freelancerId,
        ...filter,
      },
      skip,
      take: limit,
      include: {
        task: true,
        project: true,
        user: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }
}
