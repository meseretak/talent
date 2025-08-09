import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { AuditActionType, ProjectRequestStatusType, User } from '../../../generated/prisma';
import { auditService, clientService, projectRequestService } from '../../../services';
import ApiError from '../../../utils/ApiError';
import catchAsync from '../../../utils/catchAsync';

export class ProjectRequestController {
  /**
   * Create a new resource
   * @route POST /api/v1/resources
   */
  createResource = catchAsync(async (req: Request, res: Response) => {
    const userDetail = req.user as User;
    const userId = userDetail?.id || 0;
    const resource = await projectRequestService.createResource(req.body);

    // Log the action
    await auditService.logAction({
      userId,
      action: AuditActionType.CREATE,
      entityType: 'resource',
      entityId: resource.id,
      details: `Created resource: ${resource.name}`,
    });

    res.status(httpStatus.CREATED).json({
      status: 'success',
      data: resource,
    });
  });

  /**
   * Get a resource by ID
   * @route GET /api/v1/resources/:id
   */
  getResource = catchAsync(async (req: Request, res: Response) => {
    const userDetail = req.user as User;
    const userId = userDetail?.id || 0;
    const resourceId = Number(req.params.id);

    const resource = await projectRequestService.getResourceById(resourceId);

    // Log the action
    await auditService.logAction({
      userId,
      action: AuditActionType.VIEW,
      entityType: 'resource',
      entityId: resource.id,
      details: `Viewed resource: ${resource.name}`,
    });

    res.status(httpStatus.OK).json({
      status: 'success',
      data: resource,
    });
  });

  /**
   * Update a resource
   * @route PATCH /api/v1/resources/:id
   */
  updateResource = catchAsync(async (req: Request, res: Response) => {
    const userDetail = req.user as User;
    const userId = userDetail?.id || 0;
    const resourceId = Number(req.params.id);

    const resource = await projectRequestService.updateResource(resourceId, req.body);

    // Log the action
    await auditService.logAction({
      userId,
      action: AuditActionType.UPDATE,
      entityType: 'resource',
      entityId: resource.id,
      details: `Updated resource: ${resource.name}`,
    });

    res.status(httpStatus.OK).json({
      status: 'success',
      data: resource,
    });
  });

  /**
   * Add a document to a resource
   * @route POST /api/v1/resources/:id/documents
   */
  addDocumentToResource = catchAsync(async (req: Request, res: Response) => {
    const userDetail = req.user as User;
    const userId = userDetail?.id || 0;
    const resourceId = Number(req.params.id);
    const { documentId } = req.body;

    if (!documentId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Document ID is required');
    }

    const resource = await projectRequestService.addDocumentToResource(
      resourceId,
      Number(documentId),
    );

    // Log the action
    await auditService.logAction({
      userId,
      action: AuditActionType.UPDATE,
      entityType: 'resource',
      entityId: resource.id,
      details: `Added document ID: ${documentId} to resource: ${resource.name}`,
    });

    res.status(httpStatus.OK).json({
      status: 'success',
      data: resource,
    });
  });

  /**
   * Create a new project request
   * @route POST /api/v1/project-requests
   */
  createProjectRequest = catchAsync(async (req: Request, res: Response) => {
    const userDetail = req.user as User;
    const userId = userDetail?.id || 0;

    const projectRequest = await projectRequestService.createProjectRequest(req.body);

    // Log the action
    await auditService.logAction({
      userId,
      action: AuditActionType.CREATE,
      entityType: 'project_request',
      entityId: projectRequest.id,
      details: `Created project request: ${projectRequest.title}`,
    });

    res.status(httpStatus.CREATED).json({
      status: 'success',
      data: projectRequest,
    });
  });

  /**
   * Get a project request by ID
   * @route GET /api/v1/project-requests/:id
   */
  getProjectRequest = catchAsync(async (req: Request, res: Response) => {
    const userDetail = req.user as User;
    const userId = userDetail?.id || 0;
    const requestId = Number(req.params.id);

    const projectRequest = await projectRequestService.getProjectRequestById(requestId);

    // Log the action
    await auditService.logAction({
      userId,
      action: AuditActionType.VIEW,
      entityType: 'project_request',
      entityId: projectRequest.id,
      details: `Viewed project request: ${projectRequest.title}`,
    });

    res.status(httpStatus.OK).json({
      status: 'success',
      data: projectRequest,
    });
  });

  /**
   * Update a project request status
   * @route PATCH /api/v1/project-requests/:id/status
   */
  updateProjectRequestStatus = catchAsync(async (req: Request, res: Response) => {
    const userDetail = req.user as User;
    const userId = userDetail?.id || 0;
    const requestId = Number(req.params.id);
    const { status, reviewNotes } = req.body;

    if (!status) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Status is required');
    }

    const projectRequest = await projectRequestService.updateProjectRequestStatus(
      requestId,
      status as ProjectRequestStatusType,
      reviewNotes,
    );

    // Log the action
    await auditService.logAction({
      userId,
      action: AuditActionType.UPDATE,
      entityType: 'project_request',
      entityId: projectRequest.id,
      details: `Updated project request status to: ${status}`,
    });

    res.status(httpStatus.OK).json({
      status: 'success',
      data: projectRequest,
    });
  });

  /**
   * Link a project request to a project
   * @route POST /api/v1/project-requests/:id/link-project
   */
  linkProjectRequestToProject = catchAsync(async (req: Request, res: Response) => {
    const userDetail = req.user as User;
    const userId = userDetail?.id || 0;
    const requestId = Number(req.params.id);
    const { projectId } = req.body;

    if (!projectId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Project ID is required');
    }

    const projectRequest = await projectRequestService.linkProjectRequestToProject(
      requestId,
      Number(projectId),
    );

    // Log the action
    await auditService.logAction({
      userId,
      action: AuditActionType.UPDATE,
      entityType: 'project_request',
      entityId: projectRequest.id,
      details: `Linked project request to project ID: ${projectId}`,
    });

    res.status(httpStatus.OK).json({
      status: 'success',
      data: projectRequest,
    });
  });

  /**
   * Get all project requests for a client
   * @route GET /api/v1/project-requests/client
   */
  getClientProjectRequests = catchAsync(async (req: Request, res: Response) => {
    const userDetail = req.user as User;
    const userId = userDetail?.id || 0;

    if (!userId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }

    const projectRequests = await projectRequestService.getClientProjectRequests(userId);

    // Log the action
    await auditService.logAction({
      userId,
      action: AuditActionType.VIEW,
      entityType: 'client',
      entityId: 0,
      details: 'Viewed project requests for authenticated client',
    });

    res.status(httpStatus.OK).json({
      status: 'success',
      data: projectRequests,
    });
  });

  /**
   * Get all project requests with optional filters
   * @route GET /api/v1/project-requests
   */
  getAllProjectRequests = catchAsync(async (req: Request, res: Response) => {
    const { status, clientId, fromDate, toDate, page, limit, search } = req.query;

    const filters: {
      status?: ProjectRequestStatusType[];
      clientId?: number;
      fromDate?: Date;
      toDate?: Date;
      page?: number;
      limit?: number;
      search?: string;
    } = {};

    if (status) {
      filters.status = (status as string).split(',') as ProjectRequestStatusType[];
    }

    if (clientId) {
      filters.clientId = Number(clientId);
    }

    if (fromDate) {
      filters.fromDate = new Date(fromDate as string);
    }

    if (toDate) {
      filters.toDate = new Date(toDate as string);
    }

    if (page) {
      filters.page = Number(page);
    }

    if (limit) {
      filters.limit = Number(limit);
    }

    if (search) {
      filters.search = search as string;
    }

    const projectRequests = await projectRequestService.getAllProjectRequests(filters);

    res.status(httpStatus.OK).json({
      status: 'success',
      results: projectRequests.length,
      data: projectRequests,
    });
  });

  /**
   * Get my project requests
   * @route GET /api/v1/project-requests/my-requests
   */
  getMyProjectRequests = catchAsync(async (req: Request, res: Response) => {
    const userDetail = req.user as User;
    const userId = userDetail?.id || 0;

    console.log('userId', userId);

    if (!userId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }

    const { status, fromDate, toDate, page, limit, sortBy, sortOrder } = req.query;

    const filters: {
      status?: ProjectRequestStatusType[];
      fromDate?: Date;
      toDate?: Date;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {};

    if (status) {
      filters.status = (status as string).split(',') as ProjectRequestStatusType[];
    }

    if (fromDate) {
      filters.fromDate = new Date(fromDate as string);
    }

    if (toDate) {
      filters.toDate = new Date(toDate as string);
    }

    if (page) {
      filters.page = Number(page);
    }

    if (limit) {
      filters.limit = Number(limit);
    }

    if (sortBy) {
      filters.sortBy = sortBy as string;
    }

    if (sortOrder) {
      filters.sortOrder = sortOrder as 'asc' | 'desc';
    }

    const projectRequests = await projectRequestService.getMyProjectRequests(userId, filters);

    // Log the action
    await auditService.logAction({
      userId,
      action: AuditActionType.VIEW,
      entityType: 'project_request',
      entityId: 0,
      details: 'Viewed my project requests',
    });

    res.status(httpStatus.OK).json({
      status: 'success',
      results: projectRequests.length,
      data: projectRequests,
    });
  });

  /**
   * Get my resources
   * @route GET /api/v1/resources/my-resources
   */
  getMyResources = catchAsync(async (req: Request, res: Response) => {
    const userDetail = req.user as User;
    const userId = userDetail?.id || 0;

    if (!userId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }

    // Get client details for the authenticated user
    const client = await clientService.getClientByUserId(userId);

    if (!client) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Client profile not found for this user');
    }

    const resources = await projectRequestService.getResourcesByClientId(client.id);

    // Log the action
    await auditService.logAction({
      userId,
      action: AuditActionType.VIEW,
      entityType: 'resource',
      entityId: 0, // As we are fetching multiple resources, setting entityId to 0 or a generic identifier
      details: 'Viewed my resources',
    });

    res.status(httpStatus.OK).json({
      status: 'success',
      results: resources.length,
      data: resources,
    });
  });
}

export default new ProjectRequestController();
