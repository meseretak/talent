import prisma from '../../client';
import {
  Prisma,
  ProjectRequest,
  ProjectRequestStatusType,
  ProjectStatusType,
  Resource,
  ResourceStatus,
  ResourceType,
} from '../../generated/prisma';
import ApiError from '../../utils/ApiError';

export class ProjectRequestService {
  private prisma: typeof prisma;

  constructor(prismaClient: typeof prisma) {
    this.prisma = prismaClient;
  }

  // Resource Management
  async createResource(data: {
    name: string;
    description?: string;
    resourceType: ResourceType;
    inspirationLinks?: string[];
    referenceLinks?: string[];
    tags?: string[];
    clientId?: number;
    mediaSpecifications: {
      videoType?: string;
      audioType?: string;
      designType?: string;
      codeType?: string;
    };
    brandingGuidelines: {
      primaryColor?: string;
      secondaryColor?: string;
      accentColors?: string[];
      typography?: string;
      logoUrl?: string;
      brandVoice?: string;
      styleGuideUrl?: string;
    };
  }): Promise<Resource> {
    // Validate client if provided
    if (data.clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: data.clientId },
      });

      if (!client) {
        throw new ApiError(404, `Client with ID ${data.clientId} not found`);
      }
    }

    // Create media specifications
    const mediaSpecifications = await this.prisma.mediaSpecifications.create({
      data: {
        videoType: data.mediaSpecifications.videoType as any,
        audioType: data.mediaSpecifications.audioType as any,
        designType: data.mediaSpecifications.designType as any,
        codeType: data.mediaSpecifications.codeType as any,
      },
    });

    // Create branding guidelines
    const brandingGuidelines = await this.prisma.brandingGuidelines.create({
      data: {
        primaryColor: data.brandingGuidelines.primaryColor,
        secondaryColor: data.brandingGuidelines.secondaryColor,
        accentColors: data.brandingGuidelines.accentColors || [],
        typography: data.brandingGuidelines.typography,
        logoUrl: data.brandingGuidelines.logoUrl,
        brandVoice: data.brandingGuidelines.brandVoice,
        styleGuideUrl: data.brandingGuidelines.styleGuideUrl,
      },
    });

    // Create the resource
    const resource = await this.prisma.resource.create({
      data: {
        name: data.name,
        description: data.description,
        resourceType: data.resourceType,
        inspirationLinks: data.inspirationLinks || [],
        referenceLinks: data.referenceLinks || [],
        tags: data.tags || [],
        status: ResourceStatus.ACTIVE,
        createdAt: new Date(),
        client: data.clientId ? { connect: { id: data.clientId } } : undefined,
        mediaSpecifications: { connect: { id: mediaSpecifications.id } },
        brandingGuidelines: { connect: { id: brandingGuidelines.id } },
      },
      include: {
        client: true,
        mediaSpecifications: true,
        brandingGuidelines: true,
        referenceDocuments: true,
      },
    });

    return resource;
  }

  async getResourceById(id: number): Promise<Resource> {
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        client: true,
        mediaSpecifications: true,
        brandingGuidelines: true,
        referenceDocuments: true,
        projectRequests: true,
        project: true,
      },
    });

    if (!resource) {
      throw new ApiError(404, 'Resource not found');
    }

    return resource;
  }

  async updateResource(
    id: number,
    data: {
      name?: string;
      description?: string;
      resourceType?: ResourceType;
      inspirationLinks?: string[];
      referenceLinks?: string[];
      tags?: string[];
      status?: ResourceStatus;
      clientId?: number;
      mediaSpecifications?: {
        videoType?: string;
        audioType?: string;
        designType?: string;
        codeType?: string;
      };
      brandingGuidelines?: {
        primaryColor?: string;
        secondaryColor?: string;
        accentColors?: string[];
        typography?: string;
        logoUrl?: string;
        brandVoice?: string;
        styleGuideUrl?: string;
      };
    },
  ): Promise<Resource> {
    // Validate resource exists
    const resource = await this.getResourceById(id);

    // Update media specifications if provided
    if (data.mediaSpecifications) {
      await prisma.mediaSpecifications.update({
        where: { id: resource.mediaSpecificationsId },
        data: {
          videoType: data.mediaSpecifications.videoType as any,
          audioType: data.mediaSpecifications.audioType as any,
          designType: data.mediaSpecifications.designType as any,
          codeType: data.mediaSpecifications.codeType as any,
        },
      });
    }

    // Update branding guidelines if provided
    if (data.brandingGuidelines) {
      await prisma.brandingGuidelines.update({
        where: { id: resource.brandingGuidelinesId },
        data: {
          primaryColor: data.brandingGuidelines.primaryColor,
          secondaryColor: data.brandingGuidelines.secondaryColor,
          accentColors: data.brandingGuidelines.accentColors,
          typography: data.brandingGuidelines.typography,
          logoUrl: data.brandingGuidelines.logoUrl,
          brandVoice: data.brandingGuidelines.brandVoice,
          styleGuideUrl: data.brandingGuidelines.styleGuideUrl,
        },
      });
    }

    // Update the resource
    const updatedResource = await prisma.resource.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        resourceType: data.resourceType,
        inspirationLinks: data.inspirationLinks,
        referenceLinks: data.referenceLinks,
        tags: data.tags,
        status: data.status,
        updatedAt: new Date(),
        client: data.clientId ? { connect: { id: data.clientId } } : undefined,
      },
      include: {
        client: true,
        mediaSpecifications: true,
        brandingGuidelines: true,
        referenceDocuments: true,
        projectRequests: true,
      },
    });

    return updatedResource;
  }

  // Project Request Management
  async createProjectRequest(data: {
    title: string;
    description: string;
    timeline?: string;
    requirements?: string;
    clientId: number;
    resourceId: number;
  }): Promise<ProjectRequest> {
    // Validate client exists
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    });

    if (!client) {
      throw new ApiError(404, `Client with ID ${data.clientId} not found`);
    }

    // Validate resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: data.resourceId },
    });

    if (!resource) {
      throw new ApiError(404, `Resource with ID ${data.resourceId} not found`);
    }

    // Create project request
    const projectRequest = await prisma.projectRequest.create({
      data: {
        title: data.title,
        description: data.description,
        timeline: data.timeline,
        requirements: data.requirements,
        status: ProjectStatusType.IN_PROGRESS,
        client: { connect: { id: data.clientId } },
        resource: { connect: { id: data.resourceId } },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        client: true,
        resource: true,
        project: true,
      },
    });

    return projectRequest;
  }

  async getProjectRequestById(id: number): Promise<ProjectRequest> {
    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id },
      include: {
        client: true,
        resource: {
          include: {
            mediaSpecifications: true,
            brandingGuidelines: true,
          },
        },
        project: true,
      },
    });

    if (!projectRequest) {
      throw new ApiError(404, 'Project request not found');
    }

    return projectRequest;
  }

  async updateProjectRequestStatus(
    id: number,
    status: ProjectRequestStatusType,
    reviewNotes?: string,
  ): Promise<ProjectRequest> {
    // Validate project request exists
    await this.getProjectRequestById(id);

    // Update the project request
    const updatedRequest = await prisma.projectRequest.update({
      where: { id },
      data: {
        status,
        reviewNotes,
        updatedAt: new Date(),
      },
      include: {
        client: true,
        resource: true,
        project: true,
      },
    });

    return updatedRequest;
  }

  async linkProjectRequestToProject(requestId: number, projectId: number): Promise<ProjectRequest> {
    // Validate project request exists
    await this.getProjectRequestById(requestId);

    // Validate project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new ApiError(404, `Project with ID ${projectId} not found`);
    }

    // Link project request to project
    const updatedRequest = await prisma.projectRequest.update({
      where: { id: requestId },
      data: {
        project: { connect: { id: projectId } },
        status: ProjectRequestStatusType.APPROVED,
        updatedAt: new Date(),
      },
      include: {
        client: true,
        resource: true,
        project: true,
      },
    });

    return updatedRequest;
  }

  async getClientProjectRequests(userId: number): Promise<ProjectRequest[]> {
    // Get the client associated with the user
    const client = await prisma.client.findFirst({
      where: { userId },
    });

    if (!client) {
      throw new ApiError(404, 'Client not found for this user');
    }

    // Get all project requests for the client
    const projectRequests = await prisma.projectRequest.findMany({
      where: { clientId: client.id },
      include: {
        resource: {
          include: {
            mediaSpecifications: true,
            brandingGuidelines: true,
          },
        },
        project: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return projectRequests;
  }

  async getAllProjectRequests(filters?: {
    status?: ProjectRequestStatusType[];
    clientId?: number;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ProjectRequest[]> {
    const where: Prisma.ProjectRequestWhereInput = {};

    if (filters?.status) {
      where.status = { in: filters.status };
    }

    if (filters?.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters?.fromDate || filters?.toDate) {
      where.createdAt = {};

      if (filters.fromDate) {
        where.createdAt.gte = filters.fromDate;
      }

      if (filters.toDate) {
        where.createdAt.lte = filters.toDate;
      }
    }

    if (filters?.search) {
      where.OR = [
        {
          title: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const projectRequests = await prisma.projectRequest.findMany({
      where,
      include: {
        client: true,
        resource: true,
        project: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return projectRequests;
  }

  async getMyProjectRequests(
    userId: number,
    filters?: {
      status?: ProjectRequestStatusType[];
      fromDate?: Date;
      toDate?: Date;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<ProjectRequest[]> {
    // Get the client associated with the user
    const client = await prisma.client.findFirst({
      where: { userId },
    });

    if (!client) {
      throw new ApiError(404, 'Client not found for this user');
    }

    const where: Prisma.ProjectRequestWhereInput = {
      clientId: client.id,
    };

    if (filters?.status) {
      where.status = { in: filters.status };
    }

    if (filters?.fromDate || filters?.toDate) {
      where.createdAt = {};

      if (filters.fromDate) {
        where.createdAt.gte = filters.fromDate;
      }

      if (filters.toDate) {
        where.createdAt.lte = filters.toDate;
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'desc';

    const projectRequests = await prisma.projectRequest.findMany({
      where,
      include: {
        resource: {
          include: {
            mediaSpecifications: true,
            brandingGuidelines: true,
          },
        },
        project: true,
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return projectRequests;
  }

  // Helper methods
  async addDocumentToResource(resourceId: number, documentId: number): Promise<Resource> {
    // Validate resource exists
    await this.getResourceById(resourceId);

    // Validate document exists
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new ApiError(404, `Document with ID ${documentId} not found`);
    }

    // Link document to resource
    const updatedResource = await prisma.resource.update({
      where: { id: resourceId },
      data: {
        referenceDocuments: {
          connect: { id: documentId },
        },
        updatedAt: new Date(),
      },
      include: {
        client: true,
        mediaSpecifications: true,
        brandingGuidelines: true,
        referenceDocuments: true,
      },
    });

    return updatedResource;
  }

  // Resource Management
  async getResourcesByClientId(clientId: number): Promise<Resource[]> {
    const resources = await this.prisma.resource.findMany({
      where: { clientId },
      include: {
        client: false,
        mediaSpecifications: true,
        brandingGuidelines: true,
        referenceDocuments: true,
        projectRequests: true,
        project: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return resources;
  }
}
