export enum JobTimerStatus {
  ACTIVE = 'ACTIVE',
  STOPPED = 'STOPPED',
  PAUSED = 'PAUSED',
}

export interface StartTimerDto {
  taskId: number;
  userId: number;
}

export interface StopTimerDto {
  taskId: number;
  userId: number;
  freelancerId: number;
  projectId?: number;
}

export interface TimeLogDto {
  startTime: Date;
  endTime?: Date;
  taskId: number;
  userId: number;
  freelancerId: number;
  projectId?: number;
}

export interface TimeLogFilterDto {
  userId?: number;
  freelancerId?: number;
  taskId?: number;
  projectId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  minDuration?: number; // in seconds
  maxDuration?: number; // in seconds
}
