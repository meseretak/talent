import { Request, Response } from 'express';
import { PrismaClient } from '../../../generated/prisma';
import services from '../../../services';
import ApiError from '../../../utils/ApiError';
import { asyncHandler } from '../../../utils/async-handler';

const prisma = new PrismaClient();

/**
 * Create a new custom plan request
 */
export const createCustomPlanRequest = asyncHandler(async (req: Request, res: Response) => {
  const { clientId, requestedCredits, requestedBrands, durationMonths } = req.body;

  if (!clientId || !requestedCredits || !requestedBrands || !durationMonths) {
    throw new ApiError(400, 'Client ID, requested credits, brands, and duration are required');
  }

  const customPlanRequest = await services.customPlan.createCustomPlanRequest({
    clientId,
    requestedCredits,
    requestedBrands,
    durationMonths,
  });

  res.status(201).json({
    success: true,
    data: customPlanRequest,
  });
});

/**
 * Get all custom plan requests
 */
export const getCustomPlanRequests = asyncHandler(async (req: Request, res: Response) => {
  const { status, clientId } = req.query;

  const filter: any = {};

  if (status) {
    filter.status = status;
  }

  if (clientId) {
    filter.clientId = parseInt(clientId as string);
  }

  const customPlanRequests = await services.customPlan.getCustomPlanRequests(filter);

  res.status(200).json({
    success: true,
    data: customPlanRequests,
  });
});

/**
 * Get a custom plan request by ID
 */
export const getCustomPlanRequestById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, 'Custom plan request ID is required');
  }

  const customPlanRequest = await services.customPlan.getCustomPlanRequestById(id);

  if (!customPlanRequest) {
    throw new ApiError(404, 'Custom plan request not found');
  }

  res.status(200).json({
    success: true,
    data: customPlanRequest,
  });
});

/**
 * Update a custom plan request status
 */
export const updateCustomPlanRequestStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    throw new ApiError(400, 'Custom plan request ID is required');
  }

  if (!status) {
    throw new ApiError(400, 'Status is required');
  }

  const updatedRequest = await services.customPlan.updateCustomPlanRequestStatus(id, status);

  res.status(200).json({
    success: true,
    data: updatedRequest,
  });
});

/**
 * Update a custom plan request details
 */
export const updateCustomPlanRequest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { requestedCredits, requestedBrands, durationMonths } = req.body;

  if (!id) {
    throw new ApiError(400, 'Custom plan request ID is required');
  }

  if (!requestedCredits && !requestedBrands && !durationMonths) {
    throw new ApiError(400, 'At least one field to update is required');
  }

  const updatedRequest = await services.customPlan.updateCustomPlanRequest(id, {
    requestedCredits,
    requestedBrands,
    durationMonths,
  });

  res.status(200).json({
    success: true,
    data: updatedRequest,
  });
});

/**
 * Create a payment link for a custom plan request
 */
export const createCustomPlanPaymentLink = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, 'Custom plan request ID is required');
  }

  // Fetch the custom plan request
  const customPlanRequest = await services.customPlan.getCustomPlanRequestById(id);

  if (!customPlanRequest) {
    throw new ApiError(404, 'Custom plan request not found');
  }

  // Create the payment link
  const paymentLink = await services.payment.createCustomPlanPaymentLink(customPlanRequest);

  res.status(200).json({
    success: true,
    data: paymentLink,
  });
});
