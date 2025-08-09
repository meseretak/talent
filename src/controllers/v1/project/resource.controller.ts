import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { AuditActionType, ResourceStatus } from '../../../generated/prisma';
import { auditService, resourceService } from '../../../services';

// Define AuthenticatedRequest interface
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
  };
}

// Update the catchAsync function type or create a typed version
const typedCatchAsync =
  <T extends Request>(fn: (req: T, res: Response) => Promise<any>) =>
  (req: T, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };

export class ResourceController {
  createResource = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const resource = await resourceService.createResource({
      ...req.body,
      uploadedBy: { connect: { id: req.user.id } },
    });

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.CREATE,
      entityType: 'resource',
      entityId: resource.id,
      details: `Created resource: ${resource.name}`,
    });

    res.status(httpStatus.CREATED).json(resource);
  });

  getResource = typedCatchAsync<Request>(async (req, res) => {
    const resource = await resourceService.getResourceById(Number(req.params.id));
    res.json(resource);
  });

  updateResourceStatus = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const { status } = req.body;
    const resourceId = Number(req.params.id);

    const resource = await resourceService.updateResourceStatus(
      resourceId,
      status as ResourceStatus,
    );

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.UPDATE,
      entityType: 'resource',
      entityId: resource.id,
      details: `Updated resource status to: ${status}`,
    });

    res.json(resource);
  });

  getProjectResources = typedCatchAsync<Request>(async (req, res) => {
    const projectId = Number(req.params.projectId);
    const resources = await resourceService.getProjectResources(projectId, req.query);
    res.json(resources);
  });

  getTaskResources = typedCatchAsync<Request>(async (req, res) => {
    const taskId = Number(req.params.taskId);
    const resources = await resourceService.getTaskResources(taskId, req.query);
    res.json(resources);
  });

  attachResourceToTask = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const resourceId = Number(req.params.id);
    const { taskId } = req.body;

    const resource = await resourceService.attachResourceToTask(resourceId, Number(taskId));

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.UPDATE,
      entityType: 'resource',
      entityId: resource.id,
      details: `Attached resource to task (ID: ${taskId})`,
    });

    res.json(resource);
  });

  searchResources = typedCatchAsync<Request>(async (req, res) => {
    const resources = await resourceService.searchResources(req.query);
    res.json(resources);
  });

  downloadResource = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const resourceId = Number(req.params.id);
    const downloadUrl = await resourceService.getResourceDownloadUrl(resourceId, req.user.id);

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.DOWNLOAD,
      entityType: 'resource',
      entityId: resourceId,
      details: 'Downloaded resource',
    });

    res.json({ downloadUrl });
  });
}

export default new ResourceController();
