export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CreateMeetingDto {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  organizerId: number;
  projectId?: number;
  participants: number[];
  isClientInitiated?: boolean;
  meetingLink?: string;
  meetingAgenda?: string;
}

export interface UpdateMeetingDto {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  status?: MeetingStatus;
  participants?: number[];
  meetingLink?: string;
  meetingNotes?: string;
  meetingAgenda?: string;
  reminderSent?: boolean;
}

export interface MeetingFilterDto {
  organizerId?: number;
  projectId?: number;
  participantId?: number;
  status?: MeetingStatus;
  dateFrom?: Date;
  dateTo?: Date;
  isClientInitiated?: boolean;
  upcomingOnly?: boolean;
}
