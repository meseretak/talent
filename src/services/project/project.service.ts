import prisma from '../../client';
import logger from '../../config/logger';
import {
  AuditActionType,
  Prisma,
  Project,
  ProjectActivity,
  ProjectActivityType,
  ProjectRequestStatusType,
  ProjectStatusType,
} from '../../generated/prisma';
import ApiError from '../../utils/ApiError';
import auditService from '../user/audit.service';

export class ProjectService {
  // Create a project from a project request
  async createProjectFromRequest(requestId: number, adminId: number): Promise<Project> {
    // Get the project request with all related data
    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id: requestId },
      include: {
        client: {
          include: {
            user: true,
            subscription: true,
          },
        },
        resource: {
          include: {
            mediaSpecifications: true,
            brandingGuidelines: true,
          },
        },
      },
    });

    if (!projectRequest) {
      throw new ApiError(404, `Project request with ID ${requestId} not found`);
    }

    // Check if the client has available project brands in their subscription
    if (projectRequest.client.subscription) {
      // Get the subscription details
      const subscription = projectRequest.client.subscription;

      // Get the plan details to check the brand limit
      const plan = await prisma.plan.findUnique({
        where: { id: subscription.planId },
        include: {
          features: {
            include: {
              feature: true,
            },
          },
        },
      });

      // Find the brand limit feature in the plan
      const brandLimitFeature = plan?.features.find((pf) => pf.feature.key === 'brands');

      const brandsUsed = subscription.brandsUsed || 0;
      const brandsLimit = brandLimitFeature ? parseInt(brandLimitFeature.value, 10) : 0;

      if (brandsUsed >= brandsLimit) {
        throw new ApiError(
          400,
          'Client has reached their project brands limit in the subscription plan',
        );
      }
    }

    // Create the project with transaction to ensure all related data is created
    const project = await prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          name: projectRequest.title,
          description: projectRequest.description,
          status: ProjectStatusType.IN_PROGRESS,
          startDate: new Date(),
          endDate: projectRequest.timeline
            ? (() => {
                try {
                  // Try to parse the end date from the timeline string
                  const timelineParts = projectRequest.timeline.split('-');
                  if (timelineParts.length > 1) {
                    const endDateStr = timelineParts[1]?.trim();
                    const endDate = new Date(endDateStr);
                    // Verify the date is valid
                    return isNaN(endDate.getTime())
                      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      : endDate;
                  }
                  // Default to 30 days from now if timeline parsing fails
                  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                } catch (error) {
                  // Default to 30 days from now if any error occurs
                  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                }
              })()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
          // Use branding color from resource if available
          Color: projectRequest.resource?.brandingGuidelines?.primaryColor || '#4A90E2',
          client: { connect: { id: projectRequest.clientId } },
          creator: { connect: { id: adminId } },
          projectRequests: { connect: [{ id: projectRequest.id }] },
          resources: projectRequest.resourceId
            ? { connect: [{ id: projectRequest.resourceId }] }
            : undefined,
          budget: 0,
        },
        include: {
          client: true,
          projectRequests: true,
          resources: true,
        },
      });

      // Create default KanbanBoard with standard columns
      await tx.kanbanBoard.create({
        data: {
          name: `${newProject.name} Board`,
          project: {
            connect: { id: newProject.id },
          },
          projectId: newProject.id,
          columns: {
            create: [
              { name: 'To Do', order: 1 },
              { name: 'In Progress', order: 2 },
              { name: 'Done', order: 3 },
            ],
          },
        },
      });

      // Update the project request status
      await tx.projectRequest.update({
        where: { id: requestId },
        data: {
          status: ProjectRequestStatusType.APPROVED,
          project: { connect: { id: newProject.id } },
        },
      });

      // Increment the client's used project brands count
      if (projectRequest.client.subscription) {
        await tx.subscription.update({
          where: { id: projectRequest.client.subscription.id },
          data: {
            brandsUsed: {
              increment: 1,
            },
          },
        });
      }

      return newProject;
    });

    // Log project creation activity
    await this.logProjectActivity({
      projectId: project.id,
      userId: adminId,
      activityType: ProjectActivityType.CREATED,
      activityDescription: `Project created from request #${requestId}`,
    });

    return project;
  }

  // Create a project directly
  async createProjectDirect(projectData: {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    clientId: number;
    budget: number;
    color: string;
    creatorId: number;
  }): Promise<Project> {
    // Create the project with transaction to ensure all related data is created
    const project = await prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          name: projectData.name,
          description: projectData.description,
          status: ProjectStatusType.IN_PROGRESS,
          startDate: projectData.startDate,
          endDate: projectData.endDate,
          Color: projectData.color,
          client: { connect: { id: projectData.clientId } },
          creator: { connect: { id: projectData.creatorId } },
          budget: projectData.budget || 0,
        },
        include: {
          client: true,
        },
      });

      // Create default KanbanBoard with standard columns
      await tx.kanbanBoard.create({
        data: {
          name: `${newProject.name} Board`,
          project: {
            connect: { id: newProject.id },
          },
          columns: {
            create: [
              { name: 'To Do', order: 1 },
              { name: 'In Progress', order: 2 },
              { name: 'Done', order: 3 },
            ],
          },
        },
      });

      return newProject;
    });

    // Log project creation activity
    await this.logProjectActivity({
      projectId: project.id,
      userId: projectData.creatorId,
      activityType: ProjectActivityType.CREATED,
      activityDescription: `Project created directly`,
    });

    return project;
  }

  // Get project by ID with all related data
  async getProjectById(id: number): Promise<Project> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        creator: true,
        projectManager: {
          include: {
            user: true,
          },
        },
        projectTeams: {
          include: {
            freelancers: {
              include: {
                user: true,
              },
            },
          },
        },
        Task: {
          include: {
            assignedTo: {
              include: {
                freelancer: true,
              },
            },
            freelancer: {
              include: {
                user: true,
              },
            },
          },
        },
        kanbanBoard: {
          include: {
            columns: {
              include: {
                tasks: {
                  include: {
                    assignedTo: {
                      include: {
                        freelancer: true,
                      },
                    },
                    freelancer: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        projectRequests: true,
        resources: {
          include: {
            brandingGuidelines: true,
            mediaSpecifications: true,
          },
        },
        activities: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!project) {
      throw new ApiError(404, `Project with ID ${id} not found`);
    }

    return project;
  }

  // Update project status
  async updateProjectStatus(
    id: number,
    status: ProjectStatusType,
    userId: number,
  ): Promise<Project> {
    const project = await prisma.project.update({
      where: { id },
      data: { status },
      include: {
        client: true,
        projectManager: true,
        projectTeams: true,
      },
    });

    await this.logProjectActivity({
      projectId: id,
      userId,
      activityType: ProjectActivityType.UPDATED,
      activityDescription: `Project status updated to ${status}`,
    });

    return project;
  }

  // Assign project manager to project
  async assignProjectManager(
    projectId: number,
    projectManagerId: number,
    adminId: number,
  ): Promise<Project> {
    try {
      logger.debug('Starting to assign project manager', {
        projectId,
        projectManagerId,
        adminId,
      });

      if (!projectId || !projectManagerId || !adminId) {
        logger.error('Missing required parameters', {
          projectId,
          projectManagerId,
          adminId,
        });
        throw new ApiError(400, 'Project ID, Project Manager ID, and Admin ID are required');
      }

      // Verify the project exists
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        logger.error('Project not found', { projectId });
        throw new ApiError(404, `Project with ID ${projectId} not found`);
      }

      logger.debug('Project verified', { projectId });

      // Verify the project manager exists and is active
      const projectManager = await prisma.user.findUnique({
        where: { id: projectManagerId },
      });

      if (!projectManager) {
        logger.error('Project manager not found', { projectManagerId });
        throw new ApiError(404, `Project manager with ID ${projectManagerId} not found`);
      }

      logger.debug('Project manager verified', { projectManagerId });

      try {
        // Update the project with the new project manager
        const updatedProject = await prisma.project.update({
          where: { id: projectId },
          data: {
            projectManager: { connect: { id: projectManagerId } },
          },
          include: {
            client: true,
            projectManager: true,
          },
        });

        // Log the activity
        await this.logProjectActivity({
          projectId,
          userId: adminId,
          activityType: ProjectActivityType.UPDATED,
          activityDescription: `Project manager ${projectManager.firstName} ${projectManager.lastName} assigned to project`,
        });

        logger.debug('Successfully assigned project manager', {
          projectId,
          projectManagerId,
        });

        return updatedProject;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new ApiError(404, 'Project not found');
          }
          if (error.code === 'P2002') {
            throw new ApiError(400, 'Project Manager is already assigned to this project');
          }
        }
        logger.error('Failed to update project', {
          error: error instanceof Error ? error.message : 'Unknown error',
          projectId,
          projectManagerId,
        });
        throw new ApiError(
          500,
          `Failed to update project: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    } catch (error: unknown) {
      logger.error('Failed to assign project manager', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId,
        projectManagerId,
        adminId,
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        500,
        `Failed to assign project manager: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  // Add multiple freelancers to project team
  async addTeamMembers(
    projectId: number,
    freelancerIds: number[],
    userId: number,
  ): Promise<Project> {
    try {
      logger.debug('Starting to add team members', {
        projectId,
        freelancerIds,
        userId,
      });

      if (!projectId || !freelancerIds.length || !userId) {
        logger.error('Missing required parameters', { projectId, freelancerIds, userId });
        throw new ApiError(400, 'Project ID, Freelancer IDs, and User ID are required');
      }

      // Verify the project exists
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          client: true,
          projectTeams: {
            include: {
              freelancers: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      if (!project) {
        logger.error('Project not found', { projectId });
        throw new ApiError(404, `Project with ID ${projectId} not found`);
      }

      logger.debug('Project verified', { projectId });

      // Verify all freelancers exist and get their details
      const freelancers = await prisma.freelancer.findMany({
        where: {
          id: {
            in: freelancerIds,
          },
        },
        include: {
          user: true,
        },
      });

      if (freelancers.length !== freelancerIds.length) {
        logger.error('Some freelancers not found', {
          requestedIds: freelancerIds,
          foundIds: freelancers.map((f) => f.id),
        });
        throw new ApiError(404, 'One or more freelancers not found');
      }

      // Verify all freelancers have associated users
      const freelancersWithoutUsers = freelancers.filter((f) => !f.user);
      if (freelancersWithoutUsers.length > 0) {
        logger.error('Some freelancers have no associated users', {
          freelancerIds: freelancersWithoutUsers.map((f) => f.id),
        });
        throw new ApiError(400, 'One or more freelancers have no associated users');
      }

      try {
        let projectTeam;

        // Check if project already has a team
        if (project.projectTeams.length === 0) {
          // Create new team if none exists
          logger.debug('Creating new project team');
          projectTeam = await prisma.projectTeam.create({
            data: {
              project: { connect: { id: projectId } },
              freelancers: {
                connect: freelancerIds.map((id) => ({ id })),
              },
            },
            include: {
              freelancers: {
                include: {
                  user: true,
                },
              },
            },
          });
          logger.debug('Created new project team', { projectTeamId: projectTeam.id });
        } else {
          // Use existing team
          projectTeam = project.projectTeams[0];

          // Filter out freelancers who are already in the team
          const existingFreelancerIds = new Set(projectTeam.freelancers.map((f) => f.id));
          const newFreelancerIds = freelancerIds.filter((id) => !existingFreelancerIds.has(id));

          if (newFreelancerIds.length === 0) {
            logger.error('All freelancers are already in team', {
              freelancerIds,
              projectTeamId: projectTeam.id,
            });
            throw new ApiError(400, 'All freelancers are already members of this project team');
          }

          // Add freelancers to existing team
          logger.debug('Adding freelancers to existing team', {
            projectTeamId: projectTeam.id,
            newFreelancerIds,
          });
          projectTeam = await prisma.projectTeam.update({
            where: { id: projectTeam.id },
            data: {
              freelancers: {
                connect: newFreelancerIds.map((id) => ({ id })),
              },
            },
            include: {
              freelancers: {
                include: {
                  user: true,
                },
              },
            },
          });
          logger.debug('Updated project team', { projectTeamId: projectTeam.id });
        }

        // Log activity for each added freelancer
        for (const freelancer of freelancers) {
          await this.logProjectActivity({
            projectId,
            userId,
            activityType: ProjectActivityType.UPDATED,
            activityDescription: `Freelancer ${freelancer.user!.firstName} ${
              freelancer.user!.lastName
            } added to project team`,
          });
        }

        logger.debug('Successfully added team members');

        // Return the updated project with all necessary relations
        return await this.getProjectById(projectId);
      } catch (error) {
        logger.error('Failed to update project team', {
          error: error instanceof Error ? error.message : 'Unknown error',
          projectId,
          freelancerIds,
          stack: error instanceof Error ? error.stack : undefined,
        });

        if (error instanceof ApiError) {
          throw error;
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new ApiError(404, 'Project team not found');
          }
          if (error.code === 'P2002') {
            throw new ApiError(400, 'One or more freelancers are already connected to this team');
          }
        }

        throw new ApiError(500, 'Failed to update project team');
      }
    } catch (error) {
      logger.error('Failed to add team members', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId,
        freelancerIds,
        userId,
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(500, 'Failed to add team members to project');
    }
  }

  // Search projects with filters
  async searchProjects(filters: {
    status?: ProjectStatusType[];
    clientId?: number;
    projectManagerId?: number;
    freelancerId?: number;
    fromDate?: Date;
    toDate?: Date;
    searchTerm?: string;
  }): Promise<Project[]> {
    const where: Prisma.ProjectWhereInput = {};

    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.projectManagerId) {
      where.projectManagerId = filters.projectManagerId;
    }

    if (filters.freelancerId) {
      where.projectTeams = {
        some: {
          freelancers: {
            some: {
              id: filters.freelancerId,
            },
          },
        },
      };
    }

    if (filters.fromDate || filters.toDate) {
      where.createdAt = {};

      if (filters.fromDate) {
        where.createdAt.gte = filters.fromDate;
      }

      if (filters.toDate) {
        where.createdAt.lte = filters.toDate;
      }
    }

    if (filters.searchTerm) {
      where.OR = [
        { name: { contains: filters.searchTerm, mode: 'insensitive' } },
        { description: { contains: filters.searchTerm, mode: 'insensitive' } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: true,
        projectManager: {
          include: {
            user: true,
          },
        },
        projectTeams: {
          include: {
            freelancers: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return projects;
  }

  // Get client projects
  async getClientProjects(clientId: number): Promise<Project[]> {
    // Verify the client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new ApiError(404, `Client with ID ${clientId} not found`);
    }

    // Get all projects for the client
    const projects = await prisma.project.findMany({
      where: { clientId },
      include: {
        projectManager: {
          include: {
            user: true,
          },
        },
        projectTeams: {
          include: {
            freelancers: {
              include: {
                user: true,
              },
            },
          },
        },
        Task: {
          include: {
            assignedTo: {
              include: {
                freelancer: true,
              },
            },
            freelancer: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return projects;
  }

  // Log project activity
  async logProjectActivity(data: {
    projectId: number;
    userId: number;
    activityType: ProjectActivityType;
    activityDescription: string;
    taskId?: number;
  }): Promise<ProjectActivity> {
    try {
      // Verify the project exists
      const project = await prisma.project.findUnique({
        where: { id: data.projectId },
      });

      if (!project) {
        throw new ApiError(404, `Project with ID ${data.projectId} not found`);
      }

      // Create the activity
      const activity = await prisma.projectActivity.create({
        data: {
          type: data.activityType,
          description: data.activityDescription,
          project: { connect: { id: data.projectId } },
          user: { connect: { id: data.userId } },
          task: data.taskId ? { connect: { id: data.taskId } } : undefined,
        },
        include: {
          user: true,
          project: true,
          task: true,
        },
      });

      // Map ProjectActivityType to AuditActionType
      let auditAction: AuditActionType;
      switch (data.activityType) {
        case ProjectActivityType.CREATED:
          auditAction = AuditActionType.CREATE;
          break;
        case ProjectActivityType.UPDATED:
          auditAction = AuditActionType.UPDATE;
          break;
        case ProjectActivityType.DELETED:
          auditAction = AuditActionType.DELETE;
          break;
        case ProjectActivityType.COMMENTED:
          auditAction = AuditActionType.COMMENT;
          break;
        case ProjectActivityType.JOINED:
          auditAction = AuditActionType.UPDATE;
          break;
        case ProjectActivityType.MOVED:
          auditAction = AuditActionType.UPDATE;
          break;
        default:
          auditAction = AuditActionType.UPDATE;
      }

      // Log to audit service
      await auditService.logAction({
        userId: data.userId,
        action: auditAction,
        entityType: 'project',
        entityId: data.projectId,
        details: data.activityDescription,
      });

      return activity;
    } catch (error) {
      logger.error('Failed to log project activity:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId: data.projectId,
        userId: data.userId,
        activityType: data.activityType,
      });
      throw error;
    }
  }

  // Get client projects with pagination and filtering
  async getProjectsByClientId(
    clientId: number,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ) {
    // Set default pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const sortOrder = options.sortOrder || 'desc';
    const sortBy = options.sortBy || 'createdAt';

    // Build where conditions
    const where: Prisma.ProjectWhereInput = { clientId };

    // Add status filter if provided
    if (options.status) {
      // Handle comma-separated statuses
      const statusList = options.status.split(',');
      if (statusList.length > 0) {
        where.status = { in: statusList as ProjectStatusType[] };
      }
    }

    // Get total count
    const totalCount = await prisma.project.count({ where });

    // Get paginated projects
    const projects = await prisma.project.findMany({
      where,
      skip,
      take: limit,
      include: {
        client: true,
        projectManager: {
          include: {
            user: true,
          },
        },
        projectTeams: {
          include: {
            freelancers: {
              include: {
                user: true,
              },
            },
          },
        },
        Task: {
          include: {
            assignedTo: {
              include: {
                freelancer: true,
              },
            },
            freelancer: {
              include: {
                user: true,
              },
            },
          },
        },
        resources: {
          include: {
            brandingGuidelines: true,
            mediaSpecifications: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return {
      projects,
      totalCount,
      page,
      limit,
    };
  }

  // Get all projects with pagination and filtering
  async getAllProjects(
    options: {
      page?: number;
      limit?: number;
      status?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      search?: string;
    } = {},
  ) {
    // Set default pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const sortOrder = options.sortOrder || 'desc';
    const sortBy = options.sortBy || 'createdAt';

    // Build where conditions
    const where: Prisma.ProjectWhereInput = {};

    // Add status filter if provided
    if (options.status) {
      // Handle comma-separated statuses
      const statusList = options.status.split(',');
      if (statusList.length > 0) {
        where.status = { in: statusList as ProjectStatusType[] };
      }
    }

    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const totalCount = await prisma.project.count({ where });

    // Get paginated projects
    const projects = await prisma.project.findMany({
      where,
      skip,
      take: limit,
      include: {
        client: true,
        creator: true,
        projectManager: {
          include: {
            user: true,
          },
        },
        projectTeams: {
          include: {
            freelancers: {
              include: {
                user: true,
              },
            },
          },
        },
        Task: {
          include: {
            assignedTo: {
              include: {
                freelancer: true,
              },
            },
            freelancer: {
              include: {
                user: true,
              },
            },
          },
        },
        resources: {
          include: {
            brandingGuidelines: true,
            mediaSpecifications: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return {
      projects,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  // Get freelancer projects with pagination and filtering
  async getProjectsByFreelancerId(
    freelancerId: number,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ) {
    // Set default pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const sortOrder = options.sortOrder || 'desc';
    const sortBy = options.sortBy || 'createdAt';

    // Build where conditions
    const where: Prisma.ProjectWhereInput = {
      projectTeams: {
        some: {
          freelancers: {
            some: {
              id: freelancerId,
            },
          },
        },
      },
    };

    // Add status filter if provided
    if (options.status) {
      // Handle comma-separated statuses
      const statusList = options.status.split(',');
      if (statusList.length > 0) {
        where.status = { in: statusList as ProjectStatusType[] };
      }
    }

    // Get total count
    const totalCount = await prisma.project.count({ where });

    // Get paginated projects
    const projects = await prisma.project.findMany({
      where,
      skip,
      take: limit,
      include: {
        client: true,
        projectManager: {
          include: {
            user: true,
          },
        },
        projectTeams: {
          include: {
            freelancers: {
              include: {
                user: true,
              },
            },
          },
        },
        Task: {
          include: {
            assignedTo: {
              include: {
                freelancer: true,
              },
            },
            freelancer: {
              include: {
                user: true,
              },
            },
          },
        },
        resources: {
          include: {
            brandingGuidelines: true,
            mediaSpecifications: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return {
      projects,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }
}

export default new ProjectService();
