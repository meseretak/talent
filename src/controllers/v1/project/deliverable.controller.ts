import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { DeliverableService } from '../../../services/project/deliverable.service';
import catchAsync from '../../../utils/catchAsync';

const deliverableService = new DeliverableService();

export class DeliverableController {
  createDeliverable = catchAsync(async (req: Request, res: Response) => {
    const deliverable = await deliverableService.createDeliverable(req.body);
    res.status(httpStatus.CREATED).json(deliverable);
  });

  getDeliverableById = catchAsync(async (req: Request, res: Response) => {
    const deliverable = await deliverableService.getDeliverableById(Number(req.params.id));
    if (!deliverable) {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Deliverable not found' });
      return;
    }
    res.json(deliverable);
  });

  updateDeliverable = catchAsync(async (req: Request, res: Response) => {
    const deliverable = await deliverableService.updateDeliverable(Number(req.params.id), req.body);
    if (!deliverable) {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Deliverable not found' });
      return;
    }
    res.json(deliverable);
  });

  deleteDeliverable = catchAsync(async (req: Request, res: Response) => {
    await deliverableService.deleteDeliverable(Number(req.params.id));
    res.status(httpStatus.NO_CONTENT).send();
  });

  submitForReview = catchAsync(async (req: Request, res: Response) => {
    const deliverable = await deliverableService.submitForReview(Number(req.params.id));
    res.json(deliverable);
  });

  approveDeliverable = catchAsync(async (req: Request, res: Response) => {
    const deliverable = await deliverableService.approveDeliverable(Number(req.params.id));
    res.json(deliverable);
  });

  requestRevision = catchAsync(async (req: Request, res: Response) => {
    const { revisionNotes } = req.body;
    const deliverable = await deliverableService.requestRevision(
      Number(req.params.id),
      revisionNotes,
    );
    res.json(deliverable);
  });

  addFeedback = catchAsync(async (req: Request, res: Response) => {
    const { userId, feedback } = req.body;
    const deliverableFeedback = await deliverableService.addFeedback(
      Number(req.params.id),
      Number(userId),
      feedback,
    );
    res.status(httpStatus.CREATED).json(deliverableFeedback);
  });

  addComment = catchAsync(async (req: Request, res: Response) => {
    const { userId, content, parentId } = req.body;
    const comment = await deliverableService.addComment(
      Number(req.params.id),
      Number(userId),
      content,
      parentId ? Number(parentId) : undefined,
    );
    res.status(httpStatus.CREATED).json(comment);
  });

  updateMetrics = catchAsync(async (req: Request, res: Response) => {
    const { metrics } = req.body;
    const deliverable = await deliverableService.updateMetrics(Number(req.params.id), metrics);
    res.json(deliverable);
  });

  markFeedbackAsRead = catchAsync(async (req: Request, res: Response) => {
    const { isPM, isClient } = req.body;
    const result = await deliverableService.markFeedbackAsRead(
      Number(req.params.id),
      isPM,
      isClient,
    );
    res.json(result);
  });
}

export default new DeliverableController();
