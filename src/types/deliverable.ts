export enum DeliverableStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export enum FeedbackStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
}

export interface CreateDeliverableDto {
  projectId: number;
  taskId: number;
  title: string;
  description?: string;
  dueDate?: Date;
  status?: DeliverableStatus;
  priority?: string;
  attachments?: any;
  assignees?: number[];
  feedbackRequired?: boolean;
}

export interface UpdateDeliverableDto {
  title?: string;
  description?: string;
  dueDate?: Date;
  status?: DeliverableStatus;
  priority?: string;
  attachments?: any;
  assignees?: number[];
  version?: number;
  revisionNotes?: string;
  clientApproval?: boolean;
  feedbackRequired?: boolean;
  completionDate?: Date;
  acceptanceDate?: Date;
  revisionRequests?: string[];
  finalPaymentStatus?: string;
  metrics?: any;
  rating?: number;
  clientFeedback?: string;
}

export interface DeliverableFeedbackDto {
  deliverableId: number;
  userId: number;
  feedback: string;
  attachments?: any;
  status?: FeedbackStatus;
}

export interface DeliverableCommentDto {
  deliverableId: number;
  userId: number;
  content: string;
  attachments?: any;
  parentId?: number;
  mentions?: number[];
}

export interface DeliverableFilterDto {
  projectId?: number;
  taskId?: number;
  status?: DeliverableStatus;
  assigneeId?: number;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  clientApproval?: boolean;
  feedbackRequired?: boolean;
}
