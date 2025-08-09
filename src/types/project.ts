import { ProjectActivityType, ProjectStatusType } from '../generated/prisma';
import { Client } from './client';
import { Freelancer } from './freelancer';
import { User } from './user';

// Project type definition
export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatusType;
  startDate: Date;
  endDate: Date;
  budget: number;
  Color: string;
  creatorId: number;
  creator?: User;
  clientId: number;
  client?: Client;
  projectManagerId?: number;
  projectManager?: ProjectManager;
  projectTeams?: ProjectTeam[];
  activities?: ProjectActivity[];
  kanbanBoard?: KanbanBoard;
  tasks?: Task[];
  resources?: Resource[];
  projectRequests?: ProjectRequest[];
  createdAt: Date;
  updatedAt: Date;
}

// ProjectTeam interface
export interface ProjectTeam {
  id: number;
  name: string;
  freelancers?: Freelancer[];
}

// Project Manager type for references
export interface ProjectManager {
  id: number;
  user?: User;
}

// ProjectDocument interface
export interface ProjectDocument {
  id: number;
  name: string;
  url: string;
  type: string;
  size: number;
  freelancerId?: number;
}

// Task interface
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  dueDate?: Date;
  freelancerId?: number;
}

// TimeLog interface
export interface TimeLog {
  id: number;
  startTime: Date;
  endTime?: Date;
  duration: number;
  description?: string;
  freelancerId: number;
}

// Project Activity type for references
export interface ProjectActivity {
  id: number;
  type: ProjectActivityType;
  description: string;
  projectId: number;
  userId: number;
  user?: User;
  taskId?: number;
  createdAt: Date;
}

// KanbanBoard type for references
export interface KanbanBoard {
  id: number;
  name: string;
  columns?: KanbanColumn[];
}

// KanbanColumn type for references
export interface KanbanColumn {
  id: number;
  name: string;
  order: number;
  tasks?: Task[];
}

// Task type for references
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  dueDate?: Date;
  assigneeId?: number;
  columnId?: number;
}

// Resource type for references
export interface Resource {
  id: number;
  mediaSpecifications?: MediaSpecification;
  brandingGuidelines?: BrandingGuideline;
}

// MediaSpecification type for references
export interface MediaSpecification {
  id: number;
  specifications: any; // Replace with specific fields as needed
}

// BrandingGuideline type for references
export interface BrandingGuideline {
  id: number;
  primaryColor?: string;
  secondaryColor?: string;
  // Add other branding fields as needed
}

// ProjectRequest type for references
export interface ProjectRequest {
  id: number;
  title: string;
  description: string;
  status: ProjectStatusType;
  clientId: number;
  resourceId?: number;
  timeline?: string;
}

// DTO for creating a project from a request
export interface CreateProjectDto {
  requestId?: number;
  title?: string;
  label?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  clientId?: number;
  budget?: number;
  color?: string;
}

// DTO for updating project status
export interface UpdateProjectStatusDto {
  status: ProjectStatusType;
}

// DTO for assigning a project manager
export interface AssignProjectManagerDto {
  managerId: number;
}

// DTO for adding a team member/freelancer to a project
export interface AddTeamMemberDto {
  freelancerId: number;
}

// DTO for adding multiple team members/freelancers to a project
export interface AddTeamMembersDto {
  freelancerIds: number[];
}

// DTO for searching projects
export interface SearchProjectsDto {
  status?: ProjectStatusType[];
  clientId?: number;
  projectManagerId?: number;
  freelancerId?: number;
  fromDate?: Date;
  toDate?: Date;
  searchTerm?: string;
}

// DTO for project activities
export interface ProjectActivityDto {
  projectId: number;
  userId: number;
  activityType: string;
  activityDescription: string;
  taskId?: number;
}
