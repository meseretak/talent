import { Request, Response } from 'express';
import httpStatus from 'http-status';

import {
  AuditActionType,
  NotificationType,
  ProjectStatusType,
  User,
} from '../../../generated/prisma';
import { auditService, clientService, freelancerService, projectService } from '../../../services';
import notificationService from '../../../services/communication/notification.service';
import {
  AssignProjectManagerDto,
  CreateProjectDto,
  SearchProjectsDto,
  UpdateProjectStatusDto,
} from '../../../types/project';
import ApiError from '../../../utils/ApiError';
import catchAsync from '../../../utils/catchAsync';

export class ProjectController {
  createProject = catchAsync(async (req: Request, res: Response) => {
    const userDetail = req.user as User;
    const userId = userDetail?.id;
    const createProjectDto: CreateProjectDto = req.body;

    let project;

    // Check if we're creating from a request or directly
    if (createProjectDto.requestId) {
      // Create from request
      project = await projectService.createProjectFromRequest(
        Number(createProjectDto.requestId),
        userId,
      );
    } else {
      // Direct project creation
      if (!createProjectDto.title || !createProjectDto.description || !createProjectDto.clientId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required project fields');
      }

      // Use the existing service method with proper parameters
      project = await projectService.createProjectDirect({
        name: createProjectDto.title,
        description: createProjectDto.description,
        startDate: createProjectDto.startDate || new Date(),
        endDate: createProjectDto.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        clientId: Number(createProjectDto.clientId),
        budget: createProjectDto.budget || 0,
        color: createProjectDto.color || '#4A90E2',
        creatorId: userId,
      });
    }

    await auditService.logAction({
      userId,
      action: AuditActionType.CREATE,
      entityType: 'project',
      entityId: project.id,
      details: `Created project: ${project.name}`,
    });

    // Create notification for project creation
    try {
      await notificationService.createNotification({
        type: NotificationType.PROJECT,
        content: `New project "${project.name}" has been created`,
        recipientId: project.clientId, // Notify the client
        senderId: userId,
        entityType: 'project',
        entityId: project.id,
      });
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to create notification for project creation:', error);
    }

    res.status(httpStatus.CREATED).json(project);
  });

  getProject = catchAsync(async (req: Request, res: Response) => {
    const userDetail = req.user as User;
    const userId = userDetail?.id;
    const project = await projectService.getProjectById(Number(req.params.id));

    // Check permissions with full project context
    // const allowed = PolicyEngine.evaluate({
    //   user: req.user,
    //   resource: {
    //     type: 'project',
    //     id: project.id,
    //     ownerId: project.ownerId,
    //     managerId: project.managerId,
    //     teamMembers: project.teamMembers,
    //     freelancerIds: project.freelancerIds,
    //     clientId: project.clientId,
    //   },
    //   action: 'read',
    // });

    // if (!allowed) {
    //   res.status(httpStatus.FORBIDDEN).send({ message: 'Insufficient permissions' });
    //   return;
    // }

    await auditService.logAction({
      userId,
      action: AuditActionType.VIEW,
      entityType: 'project',
      entityId: project.id,
      details: `Viewed project: ${project.name}`,
    });

    res.json(project);
  });

  updateProjectStatus = catchAsync(async (req: Request, res: Response) => {
    const userDetail = req.user as User;
    const userId = userDetail?.id;
    const updateStatusDto: UpdateProjectStatusDto = req.body;
    const projectId = Number(req.params.id);

    const project = await projectService.updateProjectStatus(
      projectId,
      updateStatusDto.status,
      userId,
    );

    await auditService.logAction({
      userId,
      action: AuditActionType.UPDATE,
      entityType: 'project',
      entityId: project.id,
      details: `Updated project status to: ${updateStatusDto.status}`,
    });

    // Create notification for project status update
    try {
      const statusMessages: Record<string, string> = {
        [ProjectStatusType.IN_PROGRESS]: 'has started',
        [ProjectStatusType.REVIEW]: 'is under review',
        [ProjectStatusType.COMPLETED]: 'has been completed',
        [ProjectStatusType.ON_HOLD]: 'has been put on hold',
        [ProjectStatusType.CANCELLED]: 'has been cancelled',
        [ProjectStatusType.PAUSED]: 'has been paused',
        [ProjectStatusType.PLANNING]: 'is in planning phase',
        [ProjectStatusType.COMPLETED_WITH_ISSUES]: 'has been completed with issues',
        [ProjectStatusType.ARCHIVED]: 'has been archived',
        [ProjectStatusType.PENDING]: 'is pending',
        [ProjectStatusType.FAILED]: 'has failed',
      };

      const statusMessage =
        statusMessages[updateStatusDto.status] ||
        `status has been updated to ${updateStatusDto.status}`;

      // Notify project team members and client
      const recipients: number[] = [project.clientId];

      // Add project manager if exists
      if (project.projectManagerId) {
        recipients.push(project.projectManagerId);
      }

      // Add team members if they exist (using type assertion for safety)
      const projectWithTeams = project as any;
      if (projectWithTeams.projectTeams && Array.isArray(projectWithTeams.projectTeams)) {
        for (const team of projectWithTeams.projectTeams) {
          if (team.freelancers && Array.isArray(team.freelancers)) {
            for (const freelancer of team.freelancers) {
              if (freelancer.userId && typeof freelancer.userId === 'number') {
                recipients.push(freelancer.userId);
              }
            }
          }
        }
      }

      // Remove duplicates and current user
      const uniqueRecipients = [...new Set(recipients)].filter((id) => id !== userId);

      for (const recipientId of uniqueRecipients) {
        await notificationService.createNotification({
          type: NotificationType.PROJECT,
          content: `Project "${project.name}" ${statusMessage}`,
          recipientId,
          senderId: userId,
          entityType: 'project',
          entityId: project.id,
        });
      }
    } catch (error) {
      console.error('Failed to create notification for project status update:', error);
    }

    res.json(project);
  });

  searchProjects = catchAsync(async (req: Request, res: Response) => {
    const searchDto: SearchProjectsDto = {
      status: req.query.status
        ? ((req.query.status as string).split(',') as ProjectStatusType[])
        : undefined,
      clientId: req.query.clientId ? Number(req.query.clientId) : undefined,
      projectManagerId: req.query.managerId ? Number(req.query.managerId) : undefined,
      fromDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      toDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      searchTerm: req.query.searchTerm as string,
    };

    const projects = await projectService.searchProjects(searchDto);
    res.json(projects);
  });

  getAllProjects = catchAsync(async (req: Request, res: Response) => {
    const options = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      status: req.query.status as string,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
      search: req.query.search as string,
    };

    const result = await projectService.getAllProjects(options);
    res.json(result);
  });

  assignProjectManager = catchAsync(async (req: Request, res: Response) => {
    const userDetail = req.user as User;
    const userId = userDetail?.id;
    const assignManagerDto: AssignProjectManagerDto = req.body;
    const projectId = Number(req.params.id);

    const project = await projectService.assignProjectManager(
      projectId,
      Number(assignManagerDto.managerId),
      userId,
    );

    await auditService.logAction({
      userId,
      action: AuditActionType.UPDATE,
      entityType: 'project',
      entityId: project.id,
      details: `Assigned project manager ID: ${assignManagerDto.managerId}`,
    });

    // Create notification for project manager assignment
    try {
      await notificationService.createNotification({
        type: NotificationType.PROJECT,
        content: `You have been assigned as project manager for "${project.name}"`,
        recipientId: Number(assignManagerDto.managerId),
        senderId: userId,
        entityType: 'project',
        entityId: project.id,
      });

      // Notify the client about the manager assignment
      await notificationService.createNotification({
        type: NotificationType.PROJECT,
        content: `A project manager has been assigned to your project "${project.name}"`,
        recipientId: project.clientId,
        senderId: userId,
        entityType: 'project',
        entityId: project.id,
      });
    } catch (error) {
      console.error('Failed to create notification for project manager assignment:', error);
    }

    res.json(project);
  });

  addProjectMembers = catchAsync(async (req: Request, res: Response) => {
    const userDetail = req.user as User;
    const userId = userDetail?.id;
    const { freelancerIds } = req.body;
    const projectId = Number(req.params.id);

    if (!Array.isArray(freelancerIds) || freelancerIds.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'freelancerIds must be a non-empty array');
    }

    const project = await projectService.addTeamMembers(
      projectId,
      freelancerIds.map((id) => Number(id)),
      userId,
    );

    await auditService.logAction({
      userId,
      action: AuditActionType.UPDATE,
      entityType: 'project',
      entityId: project.id,
      details: `Added freelancers IDs: ${freelancerIds.join(', ')} to project team`,
    });

    // Create notifications for team members
    try {
      for (const freelancerId of freelancerIds) {
        await notificationService.createNotification({
          type: NotificationType.PROJECT,
          content: `You have been added to the project team for "${project.name}"`,
          recipientId: Number(freelancerId),
          senderId: userId,
          entityType: 'project',
          entityId: project.id,
        });
      }

      // Notify the client about new team members
      await notificationService.createNotification({
        type: NotificationType.PROJECT,
        content: `${freelancerIds.length} new team member(s) have been added to your project "${project.name}"`,
        recipientId: project.clientId,
        senderId: userId,
        entityType: 'project',
        entityId: project.id,
      });
    } catch (error) {
      console.error('Failed to create notification for team member addition:', error);
    }

    res.json(project);
  });

  getProjectActivities = catchAsync(async (req: Request, res: Response) => {
    const projectId = Number(req.params.id);

    const activities = await auditService.getEntityAuditLogs('project', projectId, {});

    res.json(activities);
  });

  getAssignedProjects = catchAsync(async (req: Request, res: Response) => {
    const userDetail = req.user as User;
    const userId = userDetail?.id;

    if (!userId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }

    const freelancer = await freelancerService.getFreelancerByUserId(userId);

    if (!freelancer) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Freelancer profile not found for this user');
    }

    const options = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      status: req.query.status as string,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const result = await projectService.getProjectsByFreelancerId(freelancer.id, options);

    res.json(result);
  });

  getMyProjects = catchAsync(async (req: Request, res: Response) => {
    const userDetail = req.user as User;
    const userId = userDetail?.id;

    if (!userId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }

    // Get client details for the authenticated user
    const client = await clientService.getClientByUserId(userId);

    if (!client) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Client profile not found for this user');
    }

    const options = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      status: req.query.status as string,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const result = await projectService.getProjectsByClientId(client.id, options);

    // Log the action - consider if this specific log is needed or if getProjectsByClientId handles it
    // await auditService.logAction({
    //   userId,
    //   action: AuditActionType.VIEW,
    //   entityType: 'project',
    //   entityId: 0, // Representing multiple projects
    //   details: `Viewed my projects (client ID: ${client.id})`,
    // });

    res.json(result);
  });
}

export default new ProjectController();
