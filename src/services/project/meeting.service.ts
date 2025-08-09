import { MeetingStatus, PrismaClient } from '../../generated/prisma';
import { CreateMeetingDto, UpdateMeetingDto } from '../../types/meeting';

const prisma = new PrismaClient();

export class MeetingService {
  async createMeeting(createMeetingDto: CreateMeetingDto) {
    return prisma.meeting.create({
      data: {
        title: createMeetingDto.title,
        description: createMeetingDto.description,
        startTime: createMeetingDto.startTime,
        endTime: createMeetingDto.endTime,
        isClientInitiated: createMeetingDto.isClientInitiated ?? false,
        meetingLink: createMeetingDto.meetingLink,
        meetingAgenda: createMeetingDto.meetingAgenda,
        status: MeetingStatus.SCHEDULED,
        organizer: { connect: { id: createMeetingDto.organizerId } },
        ...(createMeetingDto.projectId && {
          project: { connect: { id: createMeetingDto.projectId } },
        }),
        participants: {
          connect: createMeetingDto.participants.map((id) => ({ id })),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        organizer: true,
        participants: true,
        project: true,
      },
    });
  }

  async getMeetingById(id: number) {
    return prisma.meeting.findUnique({
      where: { id },
      include: {
        organizer: true,
        participants: true,
        project: true,
      },
    });
  }

  async updateMeeting(id: number, dto: UpdateMeetingDto) {
    const data: any = {
      updatedAt: new Date(),
    };

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.startTime !== undefined) data.startTime = dto.startTime;
    if (dto.endTime !== undefined) data.endTime = dto.endTime;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.meetingLink !== undefined) data.meetingLink = dto.meetingLink;
    if (dto.meetingNotes !== undefined) data.meetingNotes = dto.meetingNotes;
    if (dto.meetingAgenda !== undefined) data.meetingAgenda = dto.meetingAgenda;
    if (dto.reminderSent !== undefined) data.reminderSent = dto.reminderSent;

    if (dto.participants !== undefined) {
      data.participants = {
        set: dto.participants.map((id) => ({ id })),
      };
    }

    return prisma.meeting.update({
      where: { id },
      data,
      include: {
        organizer: true,
        participants: true,
        project: true,
      },
    });
  }

  async deleteMeeting(id: number) {
    return prisma.meeting.delete({
      where: { id },
    });
  }

  async listMeetings(filter: Record<string, any> = {}, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return prisma.meeting.findMany({
      where: filter,
      skip,
      take: limit,
      include: {
        organizer: true,
        participants: true,
        project: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async updateMeetingStatus(id: number, status: MeetingStatus) {
    return prisma.meeting.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  async addMeetingNotes(id: number, notes: string) {
    return prisma.meeting.update({
      where: { id },
      data: {
        meetingNotes: notes,
        updatedAt: new Date(),
      },
    });
  }

  async addMeetingAgenda(id: number, agenda: string) {
    return prisma.meeting.update({
      where: { id },
      data: {
        meetingAgenda: agenda,
        updatedAt: new Date(),
      },
    });
  }

  async sendReminder(id: number) {
    return prisma.meeting.update({
      where: { id },
      data: {
        reminderSent: true,
        updatedAt: new Date(),
      },
    });
  }

  async getProjectMeetings(projectId: number, upcomingOnly: boolean = true) {
    return prisma.meeting.findMany({
      where: {
        projectId,
        ...(upcomingOnly && {
          startTime: {
            gte: new Date(),
          },
        }),
      },
      include: {
        organizer: true,
        participants: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async getUserMeetings(userId: number, upcomingOnly: boolean = true) {
    return prisma.meeting.findMany({
      where: {
        OR: [{ organizerId: userId }, { participants: { some: { id: userId } } }],
        ...(upcomingOnly && {
          startTime: {
            gte: new Date(),
          },
        }),
      },
      include: {
        organizer: true,
        participants: true,
        project: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }
}
