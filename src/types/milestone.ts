export interface CreateMilestoneDto {
  name: string;
  description?: string;
  dueDate: Date;
  projectId: number;
  status?: string;
}

export interface UpdateMilestoneDto {
  name?: string;
  description?: string;
  dueDate?: Date;
  status?: string;
}

export interface MilestoneFilterDto {
  projectId: number;
  status?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}
