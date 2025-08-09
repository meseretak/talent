import { Request, Response } from 'express';
import { PrismaClient } from '../../../generated/prisma';

import services from '../../../services';
import ApiError from '../../../utils/ApiError';
import { asyncHandler } from '../../../utils/async-handler';

const prisma = new PrismaClient();

export const createCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
  const { planId, clientId } = req.body;

  if (!planId || !clientId) {
    throw new ApiError(400, 'Plan ID and Client ID are required');
  }

  // Update to match the service method signature
  const session = await services.payment.createCheckoutSession(planId, parseInt(clientId));

  res.status(200).json({
    success: true,
    data: session,
  });
});

export const createCustomPlanCheckout = asyncHandler(async (req: Request, res: Response) => {
  const { requestId } = req.params;

  if (!requestId) {
    throw new ApiError(400, 'Custom plan request ID is required');
  }

  // Fetch the custom plan request first
  const customPlanRequest = await prisma.customPlanRequest.findUnique({
    where: { id: requestId },
  });

  if (!customPlanRequest) {
    throw new ApiError(404, 'Custom plan request not found');
  }

  // Create the payment link using the custom plan request
  const session = await services.payment.createCustomPlanPaymentLink(customPlanRequest);

  res.status(200).json({
    success: true,
    data: session,
  });
});

export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    console.error('Webhook signature missing');
    return res.status(400).json({ error: 'Stripe signature is missing' });
  }

  try {
    // Get the raw body for signature verification
    const rawBody = req.body;

    // Parse the body for logging (but use raw body for verification)
    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody.toString());
    } catch (e) {
      parsedBody = { error: 'Could not parse body' };
    }

    // Log webhook for debugging
    console.log('Received webhook:', {
      type: parsedBody?.type,
      id: parsedBody?.id,
      timestamp: new Date().toISOString(),
    });

    const event = await services.payment.constructWebhookEvent(rawBody, signature);
    await services.payment.handleWebhookEvent(event);

    console.log('Webhook processed successfully:', event.type);
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      type: req.body?.type,
      id: req.body?.id,
    });

    // Return 400 for signature verification failures
    if (error instanceof Error && error.message.includes('signature')) {
      return res.status(400).json({
        error: 'Webhook signature verification failed',
      });
    }

    // For processing errors, still return 200 to acknowledge receipt
    // but log the error for debugging
    console.error('Webhook processing failed but acknowledging receipt:', error);
    return res.status(200).json({
      received: true,
      warning: 'Event processed with errors, check server logs',
    });
  }
});

export const getPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
  const { clientId } = req.params;

  if (!clientId) {
    throw new ApiError(400, 'Client ID is required');
  }

  const history = await services.payment.getClientPaymentHistory(parseInt(clientId));

  res.status(200).json({
    success: true,
    data: history,
  });
});

export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
  const { invoiceId } = req.params;

  if (!invoiceId) {
    throw new ApiError(400, 'Invoice ID is required');
  }

  const invoice = await services.payment.getInvoiceById(parseInt(invoiceId));

  res.status(200).json({
    success: true,
    data: invoice,
  });
});

export const createPortalSession = asyncHandler(async (req: Request, res: Response) => {
  const { clientId } = req.body;

  if (!clientId) {
    throw new ApiError(400, 'Client ID is required');
  }

  const session = await services.payment.createCustomerPortalSession(clientId);

  res.status(200).json({
    success: true,
    data: session,
  });
});

export const refundPayment = asyncHandler(async (req: Request, res: Response) => {
  const { paymentId, amount, reason } = req.body;

  if (!paymentId) {
    throw new ApiError(400, 'Payment ID is required');
  }

  const refund = await services.payment.createRefund(paymentId, amount, reason);

  res.status(200).json({
    success: true,
    data: refund,
  });
});

export const updatePaymentMethod = asyncHandler(async (req: Request, res: Response) => {
  const { clientId, paymentMethodId } = req.body;

  if (!clientId || !paymentMethodId) {
    throw new ApiError(400, 'Client ID and Payment Method ID are required');
  }

  const result = await services.payment.updateDefaultPaymentMethod(clientId, paymentMethodId);

  res.status(200).json({
    success: true,
    data: result,
  });
});
