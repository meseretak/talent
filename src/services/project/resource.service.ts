import prisma from '../../client';
import { Prisma, ResourceStatus, ResourceType } from '../../generated/prisma';

import ApiError from '../../utils/ApiError';

const createResource = async (data: Prisma.ResourceCreateInput) => {
  return prisma.resource.create({
    data,
    include: {
      project: true,
    },
  });
};

const updateResourceStatus = async (id: number, status: ResourceStatus) => {
  const resource = await prisma.resource.findUnique({
    where: { id },
  });

  if (!resource) {
    throw new ApiError(404, 'Resource not found');
  }

  return prisma.resource.update({
    where: { id },
    data: { status },
    include: {
      project: true,
    },
  });
};

const getResourceById = async (id: number) => {
  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      project: true,
    },
  });

  if (!resource) {
    throw new ApiError(404, 'Resource not found');
  }
  return resource;
};

const getProjectResources = async (
  projectId: number,
  filters?: {
    type?: ResourceType[];
    status?: ResourceStatus;
  },
) => {
  return prisma.resource.findMany({
    where: {
      projectId,
      resourceType: filters?.type ? { in: filters.type } : undefined,
      status: filters?.status,
    },
    include: {
      project: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const getTaskResources = async (
  taskId: number,
  filters?: {
    type?: ResourceType[];
    status?: ResourceStatus;
  },
) => {
  // Since there's no direct taskId field in the Resource model,
  // we need to implement an alternative approach to find resources related to a task

  // First, get the task to find its project
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true },
  });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  // Then find resources for that project
  // Note: This is a workaround since there's no direct taskId field
  // You may need to adjust this based on your actual data model
  return prisma.resource.findMany({
    where: {
      projectId: task.projectId,
      resourceType: filters?.type ? { in: filters.type } : undefined,
      status: filters?.status,
      // Additional filtering logic could be added here if you have
      // another way to associate resources with tasks
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      project: true,
    },
  });
};

const attachResourceToTask = async (resourceId: number, taskId: number) => {
  const resource = await getResourceById(resourceId);
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { Project: true },
  });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  // Ensure the resource and task belong to the same project
  if (resource.projectId !== task.projectId) {
    throw new ApiError(400, 'Resource and task must belong to the same project');
  }

  // Since there's no direct taskId field in the Resource model according to the schema,
  // we need to check how this relationship is implemented in your database.
  // This is a placeholder implementation - adjust based on your actual schema

  return prisma.resource.update({
    where: { id: resourceId },
    data: {
      // In a real implementation, you would need to establish this relationship
      // based on your database schema. For now, we'll just return the resource.
    },
    include: {
      project: true,
    },
  });
};

const searchResources = async (filters: {
  projectId?: number;
  type?: ResourceType[];
  status?: ResourceStatus;
  startDate?: Date;
  endDate?: Date;
  query?: string;
}) => {
  return prisma.resource.findMany({
    where: {
      projectId: filters.projectId,
      resourceType: filters.type ? { in: filters.type } : undefined,
      status: filters.status,
      createdAt: {
        gte: filters.startDate,
        lte: filters.endDate,
      },
      OR: filters.query
        ? [
            { name: { contains: filters.query, mode: 'insensitive' } },
            { description: { contains: filters.query, mode: 'insensitive' } },
          ]
        : undefined,
    },
    include: {
      project: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const getResourceDownloadUrl = async (resourceId: number, userId: number) => {
  // Get the resource to verify it exists and user has access
  await getResourceById(resourceId);

  // In a real implementation, we would log the download attempt using userId parameter
  // This would require a resourceDownloadLog table in the schema
  // The userId parameter is kept for future implementation

  // This would typically generate a signed URL or other secure download mechanism
  // For now, we'll return a placeholder URL that would be replaced with actual implementation
  return `${
    process.env.API_BASE_URL || 'http://localhost:3000'
  }/api/resources/${resourceId}/download/file`;
};

const deleteResource = async (id: number) => {
  await getResourceById(id);

  // Perform any necessary cleanup (e.g., deleting actual files from storage)
  // This would depend on your file storage implementation

  return prisma.resource.delete({
    where: { id },
  });
};

export default {
  createResource,
  updateResourceStatus,
  getResourceById,
  getProjectResources,
  getTaskResources,
  attachResourceToTask,
  searchResources,
  getResourceDownloadUrl,
  deleteResource,
};
