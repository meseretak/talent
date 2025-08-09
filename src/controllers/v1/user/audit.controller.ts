import { Request, Response } from 'express';
import { auditService } from '../../../services';
import catchAsync from '../../../utils/catchAsync';

const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const logs = await auditService.getAuditLogs(req.query);
  res.json(logs);
});

const getEntityAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const { entityType, entityId } = req.params;
  const logs = await auditService.getEntityAuditLogs(entityType, Number(entityId), req.query);
  res.json(logs);
});

const getUserAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const logs = await auditService.getUserAuditLogs(Number(userId), req.query);
  res.json(logs);
});

export default {
  getAuditLogs,
  getEntityAuditLogs,
  getUserAuditLogs,
};
