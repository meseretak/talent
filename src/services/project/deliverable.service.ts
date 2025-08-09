import {
  DeliverableStatus,
  FeedbackStatus,
  PaymentStatusType,
  PrismaClient,
  TaskPriorityType,
} from '../../generated/prisma';
import { CreateDeliverableDto, UpdateDeliverableDto } from '../../types/deliverable';

const prisma = new PrismaClient();

export class DeliverableService {
  async createDeliverable(createDeliverableDto: CreateDeliverableDto) {
    const status = createDeliverableDto.status || DeliverableStatus.DRAFT;

    return prisma.deliverable.create({
      data: {
        title: createDeliverableDto.title,
        description: createDeliverableDto.description,
        dueDate: createDeliverableDto.dueDate,
        status: status as DeliverableStatus,
        priority: createDeliverableDto.priority as TaskPriorityType,
        attachments: createDeliverableDto.attachments,
        feedbackRequired: createDeliverableDto.feedbackRequired,
        project: { connect: { id: createDeliverableDto.projectId } },
        task: { connect: { id: createDeliverableDto.taskId } },
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(createDeliverableDto.assignees && {
          assignees: {
            connect: createDeliverableDto.assignees.map((id) => ({ id })),
          },
        }),
      },
      include: {
        project: true,
        task: true,
        assignees: true,
      },
    });
  }

  async getDeliverableById(id: number) {
    return prisma.deliverable.findUnique({
      where: { id },
      include: {
        project: true,
        task: true,
        assignees: true,
        feedbacks: {
          include: {
            user: true,
          },
        },
        comments: {
          include: {
            user: true,
            replies: true,
          },
        },
        relatedTasks: true,
      },
    });
  }

  async updateDeliverable(id: number, dto: UpdateDeliverableDto) {
    const data: any = {
      updatedAt: new Date(),
    };

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate;
    if (dto.status !== undefined) data.status = dto.status as DeliverableStatus;
    if (dto.priority !== undefined) data.priority = dto.priority as TaskPriorityType;
    if (dto.attachments !== undefined) data.attachments = dto.attachments;
    if (dto.version !== undefined) data.version = dto.version;
    if (dto.revisionNotes !== undefined) data.revisionNotes = dto.revisionNotes;
    if (dto.clientApproval !== undefined) data.clientApproval = dto.clientApproval;
    if (dto.feedbackRequired !== undefined) data.feedbackRequired = dto.feedbackRequired;
    if (dto.completionDate !== undefined) data.completionDate = dto.completionDate;
    if (dto.acceptanceDate !== undefined) data.acceptanceDate = dto.acceptanceDate;
    if (dto.revisionRequests !== undefined) data.revisionRequests = dto.revisionRequests;
    if (dto.finalPaymentStatus !== undefined)
      data.finalPaymentStatus = dto.finalPaymentStatus as PaymentStatusType;
    if (dto.metrics !== undefined) data.metrics = dto.metrics;
    if (dto.rating !== undefined) data.rating = dto.rating;
    if (dto.clientFeedback !== undefined) data.clientFeedback = dto.clientFeedback;

    if (dto.assignees) {
      data.assignees = {
        set: dto.assignees.map((id) => ({ id })),
      };
    }

    return prisma.deliverable.update({
      where: { id },
      data,
      include: {
        project: true,
        task: true,
        assignees: true,
      },
    });
  }

  async deleteDeliverable(id: number) {
    return prisma.deliverable.delete({
      where: { id },
    });
  }

  async submitForReview(deliverableId: number) {
    return prisma.deliverable.update({
      where: { id: deliverableId },
      data: {
        status: DeliverableStatus.REVIEW,
        updatedAt: new Date(),
      },
    });
  }

  async approveDeliverable(deliverableId: number) {
    return prisma.deliverable.update({
      where: { id: deliverableId },
      data: {
        status: DeliverableStatus.APPROVED,
        clientApproval: true,
        acceptanceDate: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async requestRevision(deliverableId: number, revisionNotes: string) {
    return prisma.deliverable.update({
      where: { id: deliverableId },
      data: {
        status: DeliverableStatus.IN_PROGRESS,
        revisionNotes,
        updatedAt: new Date(),
      },
    });
  }

  async addFeedback(deliverableId: number, userId: number, feedback: string) {
    return prisma.deliverableFeedback.create({
      data: {
        deliverable: { connect: { id: deliverableId } },
        user: { connect: { id: userId } },
        feedback,
        status: FeedbackStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        user: true,
      },
    });
  }

  async addComment(deliverableId: number, userId: number, content: string, parentId?: number) {
    return prisma.deliverableComment.create({
      data: {
        deliverable: { connect: { id: deliverableId } },
        user: { connect: { id: userId } },
        content,
        ...(parentId && { parent: { connect: { id: parentId } } }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        user: true,
        replies: true,
      },
    });
  }

  async updateMetrics(deliverableId: number, metrics: any) {
    return prisma.deliverable.update({
      where: { id: deliverableId },
      data: {
        metrics,
        updatedAt: new Date(),
      },
    });
  }

  async markFeedbackAsRead(
    deliverableId: number,
    isPM: boolean = false,
    isClient: boolean = false,
  ) {
    return prisma.deliverableFeedback.updateMany({
      where: { deliverableId },
      data: {
        ...(isPM && { isReadByPM: true }),
        ...(isClient && { isReadByClient: true }),
        updatedAt: new Date(),
      },
    });
  }
}
