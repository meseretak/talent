import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { freelancerService } from '../../../services';
import catchAsync from '../../../utils/catchAsync';

/**
 * Get featured freelancers with pagination
 */
const getFeaturedFreelancers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const size = parseInt(req.query.size as string) || 10;

  const result = await freelancerService.getFeaturedFreelancers(page, size);
  res.status(httpStatus.OK).send(result);
});

/**
 * Toggle featured status
 */
const toggleFeaturedStatus = catchAsync(async (req: Request, res: Response) => {
  const { freelancerId } = req.params;
  const { featured } = req.body;

  const result = await freelancerService.toggleFeaturedStatus(parseInt(freelancerId), featured);
  res.status(httpStatus.OK).send(result);
});

export default {
  getFeaturedFreelancers,
  toggleFeaturedStatus,
};
