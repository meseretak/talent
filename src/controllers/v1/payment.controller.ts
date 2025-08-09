import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { PaymentMethodType } from '../../generated/prisma';
import paymentService from '../../services/payment.service';
import ApiError from '../../utils/ApiError';
import catchAsync from '../../utils/catchAsync';

/**
 * Create a new subscription
 */
const createSubscription = catchAsync(async (req: Request, res: Response) => {
  const { clientId, planId, priceId, customCredits, paymentMethod } = req.body;

  if (!clientId || !planId || !paymentMethod) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required fields');
  }

  const subscription = await paymentService.createSubscription({
    clientId: Number(clientId),
    planId,
    priceId,
    customCredits,
    paymentMethod: paymentMethod as PaymentMethodType,
  });

  res.status(httpStatus.CREATED).send(subscription);
});

/**
 * Renew a subscription
 */
const renewSubscription = catchAsync(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;

  if (!subscriptionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Subscription ID is required');
  }

  const result = await paymentService.renewSubscription(subscriptionId);
  res.status(httpStatus.OK).send(result);
});

/**
 * Cancel a subscription
 */
const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const { reason } = req.body;

  if (!subscriptionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Subscription ID is required');
  }

  const subscription = await paymentService.cancelSubscription(subscriptionId, reason);
  res.status(httpStatus.OK).send(subscription);
});

/**
 * Change subscription plan
 */
const changePlan = catchAsync(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const { newPlanId, newPriceId, reason, prorated } = req.body;

  if (!subscriptionId || !newPlanId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Subscription ID and new plan ID are required');
  }

  const result = await paymentService.changePlan(subscriptionId, {
    newPlanId,
    newPriceId,
    reason,
    prorated,
  });

  res.status(httpStatus.OK).send(result);
});

/**
 * Process a payment for a subscription invoice
 */
const processPayment = catchAsync(async (req: Request, res: Response) => {
  const { invoiceId } = req.params;
  const { paymentMethod, transactionDetails, amount } = req.body;

  if (!invoiceId || !paymentMethod || !transactionDetails) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required fields');
  }

  const result = await paymentService.processSubscriptionPayment(Number(invoiceId), {
    paymentMethod: paymentMethod as PaymentMethodType,
    transactionDetails,
    amount,
  });

  res.status(httpStatus.OK).send(result);
});

/**
 * Get subscription details
 */
const getSubscription = catchAsync(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;

  if (!subscriptionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Subscription ID is required');
  }

  const subscription = await paymentService.getSubscription(subscriptionId);
  res.status(httpStatus.OK).send(subscription);
});

/**
 * Get client's active subscription
 */
const getClientSubscription = catchAsync(async (req: Request, res: Response) => {
  const { clientId } = req.params;

  if (!clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Client ID is required');
  }

  const subscription = await paymentService.getClientSubscription(Number(clientId));

  if (!subscription) {
    res
      .status(httpStatus.NOT_FOUND)
      .send({ message: 'No active subscription found for this client' });
    return;
  }

  res.status(httpStatus.OK).send(subscription);
});

/**
 * Get subscription usage statistics
 */
const getSubscriptionUsage = catchAsync(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;

  if (!subscriptionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Subscription ID is required');
  }

  const usageStats = await paymentService.getSubscriptionUsage(subscriptionId);
  res.status(httpStatus.OK).send(usageStats);
});

export default {
  createSubscription,
  renewSubscription,
  cancelSubscription,
  changePlan,
  processPayment,
  getSubscription,
  getClientSubscription,
  getSubscriptionUsage,
};
