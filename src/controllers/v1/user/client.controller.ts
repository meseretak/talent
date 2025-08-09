import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ClientType } from '../../../generated/prisma';
import services, { projectService } from '../../../services';
import auditService from '../../../services/user/audit.service';
import { AuditActionType } from '../../../types/audit';
import { User } from '../../../types/user';
import ApiError from '../../../utils/ApiError';
import { paginatedResponse, successResponse } from '../../../utils/apiResponse';
import catchAsync from '../../../utils/catchAsync';

/**
 * Create a new client profile for an existing user
 * @route POST /v1/clients
 */

const createClient = catchAsync(async (req: Request, res: Response) => {
  // Use logged-in user's ID if not provided
  const userDetail = req.user as User;
  const userId = req.body.userId || userDetail?.id;

  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User ID is required');
  }

  // Create client
  const client = await services.client.createClient({
    ...req.body,
    userId,
  });

  // Log the action
  await auditService.logAction({
    userId,
    action: AuditActionType.CREATE,
    entityType: 'client',
    entityId: client.id,
    details: `Created client profile for user ID: ${userId}`,
  });

  res
    .status(httpStatus.CREATED)
    .json(successResponse(client, 'Client profile created successfully'));
});

/**
 * Get client profile for the logged-in user
 * @route GET /v1/clients/me
 */
const getMyClientProfile = catchAsync(async (req: Request, res: Response) => {
  const userDetail = req.user as User;
  const userId = userDetail?.id;

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
  }

  const client = await services.client.getClientByUserId(userId);

  if (!client) {
    res.status(httpStatus.OK).json(successResponse([], 'No client profile found'));
    return;
  }

  res.status(httpStatus.OK).json(successResponse(client, 'Client profile retrieved successfully'));
});

/**
 * Get client by ID
 * @route GET /v1/clients/:id
 */
const getClientById = catchAsync(async (req: Request, res: Response) => {
  const clientId = parseInt(req.params.id);
  const client = await services.client.getClientById(clientId);

  res.status(httpStatus.OK).json(successResponse(client, 'Client retrieved successfully'));
});

/**
 * Update client profile
 * @route PATCH /v1/clients/:id
 */
const updateClient = catchAsync(async (req: Request, res: Response) => {
  // Handle empty request body
  if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Request body cannot be empty');
  }

  const clientId = parseInt(req.params.id);
  const userDetail = req.user as User;
  const userId = userDetail?.id;

  // First get the client to verify ownership
  const existingClient = await services.client.getClientById(clientId);

  // Check if the logged-in user owns this client profile or is an admin
  if (
    existingClient.userId !== userId &&
    userDetail.role !== 'ADMIN' &&
    userDetail.role !== 'SUPER_ADMIN'
  ) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You do not have permission to update this client profile',
    );
  }

  // Clean up request body to avoid updating with undefined/null values
  const cleanUpdateData: Record<string, any> = {};

  // Only include defined fields in the update
  Object.keys(req.body).forEach((key) => {
    if (req.body[key] !== undefined && req.body[key] !== null) {
      cleanUpdateData[key] = req.body[key];
    }
  });

  const updatedClient = await services.client.updateClient(clientId, cleanUpdateData);

  // Log the action
  await auditService.logAction({
    userId,
    action: AuditActionType.UPDATE,
    entityType: 'client',
    entityId: clientId,
    details: `Updated client profile, ID: ${clientId}`,
  });

  res
    .status(httpStatus.OK)
    .json(successResponse(updatedClient, 'Client profile updated successfully'));
});

/**
 * Get client types for dropdown
 * @route GET /v1/clients/types
 */
const getClientTypes = catchAsync(async (req: Request, res: Response) => {
  // Extract client types from enum
  const clientTypes = Object.values(ClientType);

  res
    .status(httpStatus.OK)
    .json(successResponse(clientTypes, 'Client types retrieved successfully'));
});

/**
 * Get all clients with pagination and filtering
 * @route GET /v1/clients
 */
const getAllClients = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search, sortBy, sortOrder, clientType } = req.query;

  const result = await services.client.getAllClients(
    parseInt(page as string, 10),
    parseInt(limit as string, 10),
    search as string,
    sortBy as string,
    sortOrder as 'asc' | 'desc',
    clientType as string,
  );

  res
    .status(httpStatus.OK)
    .json(
      paginatedResponse(
        result.clients,
        result.page,
        result.limit,
        result.totalCount,
        'Clients retrieved successfully',
      ),
    );
});

/**
 * Delete a client
 * @route DELETE /v1/clients/:id
 */
const deleteClient = catchAsync(async (req: Request, res: Response) => {
  const clientId = parseInt(req.params.id);
  const userDetail = req.user as User;

  // Only admins can delete clients
  if (userDetail.role !== 'ADMIN' && userDetail.role !== 'SUPER_ADMIN') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to delete clients');
  }

  await services.client.deleteClient(clientId);

  // Log the action
  await auditService.logAction({
    userId: userDetail.id,
    action: AuditActionType.DELETE,
    entityType: 'client',
    entityId: clientId,
    details: `Deleted client ID: ${clientId}`,
  });

  res.status(httpStatus.OK).json(successResponse(null, 'Client deleted successfully'));
});

/**
 * Get client statistics
 * @route GET /v1/clients/:id/stats
 */
const getClientStats = catchAsync(async (req: Request, res: Response) => {
  const clientId = parseInt(req.params.id);

  // Get client by ID to verify it exists
  const client = await services.client.getClientById(clientId);

  // Get statistics from the statistics information
  const stats = client.statisticsInformation;

  res
    .status(httpStatus.OK)
    .json(successResponse(stats, 'Client statistics retrieved successfully'));
});

/**
 * Get client projects
 * @route GET /v1/clients/:id/projects
 */
const getClientProjects = catchAsync(async (req: Request, res: Response) => {
  const clientId = parseInt(req.params.id);
  const { page = 1, limit = 10, status, sortBy, sortOrder } = req.query;

  // Get projects for this client from project service
  const projects = await projectService.getProjectsByClientId(clientId, {
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
    status: status as string,
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  });

  res
    .status(httpStatus.OK)
    .json(
      paginatedResponse(
        projects.projects,
        projects.page,
        projects.limit,
        projects.totalCount,
        'Client projects retrieved successfully',
      ),
    );
});

export default {
  createClient,
  getMyClientProfile,
  getClientById,
  updateClient,
  getClientTypes,
  getAllClients,
  deleteClient,
  getClientStats,
  getClientProjects,
};
