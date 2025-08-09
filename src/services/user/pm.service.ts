import { userService } from '..';
import {
  PrismaClient,
  Project,
  ProjectManager,
  ProjectStatusType,
  Role,
  Task,
  TaskStatus,
} from '../../generated/prisma';

const prisma = new PrismaClient();

type CreateProjectManagerDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  avatar?: string;
};

export class PMService {
  // Create a new Project Manager profile
  async createProjectManager(data: CreateProjectManagerDto): Promise<ProjectManager> {
    // Validate required fields
    if (!data.email || typeof data.email !== 'string') {
      throw new Error('Email is required and must be a string');
    }

    if (!data.password || typeof data.password !== 'string') {
      throw new Error('Password is required and must be a string');
    }

    if (!data.firstName || typeof data.firstName !== 'string') {
      throw new Error('First name is required and must be a string');
    }

    if (!data.lastName || typeof data.lastName !== 'string') {
      throw new Error('Last name is required and must be a string');
    }

    const user = await userService.createUser({
      ...data,
      role: Role.PROJECT_MANAGER,
    });

    return prisma.projectManager.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
      },
      include: {
        user: true,
        managedProjects: true,
      },
    });
  }

  // Get Project Manager by ID with related data
  async getProjectManager(pmId: number): Promise<ProjectManager | null> {
    if (!pmId || isNaN(Number(pmId))) {
      throw new Error('Invalid pmId provided');
    }

    return prisma.projectManager.findUnique({
      where: { id: Number(pmId) },
      include: {
        user: true,
        managedProjects: {
          include: {
            Task: true,
            milestones: true,
            projectTeams: true,
            client: true,
          },
        },
        tasks: {
          include: {
            Project: true,
            assignedTo: true,
          },
        },
      },
    });
  }

  // Get Project Manager by User ID
  async getProjectManagerByUserId(userId: number): Promise<ProjectManager | null> {
    if (!userId || isNaN(Number(userId))) {
      throw new Error('Invalid userId provided');
    }

    return prisma.projectManager.findUnique({
      where: { userId: Number(userId) },
      include: {
        user: true,
        managedProjects: {
          include: {
            Task: true,
            milestones: true,
            projectTeams: true,
          },
        },
        tasks: true,
      },
    });
  }

  // Update Project Manager details
  async updateProjectManager(
    pmId: number,
    data: Partial<{
      userId: number;
    }>,
  ): Promise<ProjectManager> {
    if (!pmId || isNaN(Number(pmId))) {
      throw new Error('Invalid pmId provided');
    }

    // Convert any numeric fields in data
    const processedData = { ...data };
    if (processedData.userId) {
      processedData.userId = Number(processedData.userId);
    }

    return prisma.projectManager.update({
      where: { id: Number(pmId) },
      data: processedData,
      include: {
        user: true,
        managedProjects: true,
        tasks: true,
      },
    });
  }

  // Delete Project Manager profile
  async deleteProjectManager(pmId: number): Promise<ProjectManager> {
    if (!pmId || isNaN(Number(pmId))) {
      throw new Error('Invalid pmId provided');
    }

    return prisma.projectManager.delete({
      where: { id: Number(pmId) },
    });
  }

  // Assign project to Project Manager
  async assignProject(pmId: number, projectId: number): Promise<Project> {
    if (!projectId || isNaN(Number(projectId))) {
      throw new Error('Invalid projectId provided');
    }

    return prisma.project.update({
      where: {
        id: Number(projectId),
      },
      data: {
        projectManager: {
          connect: {
            id: Number(pmId),
          },
        },
      },
      include: {
        projectManager: {
          include: {
            user: true,
          },
        },
        Task: true,
        milestones: true,
      },
    });
  }

  // Get all projects managed by a PM
  async getManagedProjects(pmId: number): Promise<Project[]> {
    if (!pmId || isNaN(Number(pmId))) {
      throw new Error('Invalid pmId provided');
    }

    return prisma.project.findMany({
      where: {
        projectManager: {
          id: Number(pmId),
        },
      },
      include: {
        Task: true,
        projectTeams: {
          include: {
            freelancers: true,
          },
        },
        client: true,
        milestones: true,
        ProjectDocument: true,
      },
    });
  }

  // Assign task to Project Manager
  async assignTask(pmId: number, taskId: number): Promise<Task> {
    if (!taskId || isNaN(Number(taskId))) {
      throw new Error('Invalid taskId provided');
    }

    return prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        projectManager: {
          connect: {
            id: Number(pmId),
          },
        },
      },
      include: {
        Project: true,
        assignedTo: true,
        milestone: true,
      },
    });
  }

  // Get all Task managed by a PM
  async getManagedTasks(pmId: number): Promise<Task[]> {
    if (!pmId || isNaN(Number(pmId))) {
      throw new Error('Invalid pmId provided');
    }

    return prisma.task.findMany({
      where: {
        projectManager: {
          id: Number(pmId),
        },
      },
      include: {
        Project: true,
        assignedTo: true,
        milestone: true,
        documents: true,
        comments: {
          include: {
            author: true,
          },
        },
      },
    });
  }

  // Get PM performance metrics
  async getPerformanceMetrics(pmId: number) {
    if (!pmId || isNaN(Number(pmId))) {
      throw new Error('Invalid pmId provided');
    }

    const projects = await prisma.project.findMany({
      where: {
        projectManagerId: Number(pmId),
      },
      include: {
        Task: true,
        milestones: true,
        deliverables: true,
      },
    });

    const tasks = projects.flatMap((p) => p.Task);
    const milestones = projects.flatMap((p) => p.milestones);

    return {
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === ProjectStatusType.IN_PROGRESS).length,
      completedProjects: projects.filter((p) => p.status === ProjectStatusType.COMPLETED).length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
      totalMilestones: milestones.length,
      completedMilestones: milestones.filter((m) => m.status === TaskStatus.COMPLETED).length,
      successfulOutcomes: projects.filter((p) => p.deliverables?.length > 0).length,
    };
  }

  // Get all Project Managers with their basic info
  async getAllProjectManagers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const { page = 1, limit = 10, search, status } = params;

    const where: any = {};

    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      // Assuming status on ProjectManager refers to the user status
      where.user = { ...where.user, status: status };
    }

    const totalRecords = await prisma.projectManager.count({ where });
    const projectManagers = await prisma.projectManager.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            status: true,
          },
        },
        managedProjects: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
            client: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    return {
      data: projectManagers,
      meta: {
        total: totalRecords,
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  // Check if user is a Project Manager
  async isProjectManager(userId: number): Promise<boolean> {
    if (!userId || isNaN(Number(userId))) {
      throw new Error('Invalid userId provided');
    }

    const pm = await prisma.projectManager.findUnique({
      where: { userId: Number(userId) },
    });
    return !!pm;
  }
}

export default new PMService();
