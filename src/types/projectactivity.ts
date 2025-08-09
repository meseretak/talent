export enum ProjectActivityType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  MILESTONE_REACHED = 'MILESTONE_REACHED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  MEETING_SCHEDULED = 'MEETING_SCHEDULED',
  DELIVERABLE_SUBMITTED = 'DELIVERABLE_SUBMITTED',
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  OTHER = 'OTHER',
}

export interface CreateActivityDto {
  type: ProjectActivityType;
  description: string;
  userId: number;
  projectId: number;
  taskId?: number;
  relatedTaskIds?: number[];
}

export interface UpdateActivityDto {
  description?: string;
  relatedTaskIds?: number[];
}

export interface ActivityFilterDto {
  userId?: number;
  projectId?: number;
  taskId?: number;
  type?: ProjectActivityType;
  dateFrom?: Date;
  dateTo?: Date;
}
