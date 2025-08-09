import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { NotificationType, User } from '../../../generated/prisma';
import { services } from '../../../services';
import notificationService from '../../../services/communication/notification.service';
import subscriptionService from '../../../services/subscription/subscription.service';
import { CreateSubscriptionDto, SubscriptionResponseDto } from '../../../types/subscription';
import ApiError from '../../../utils/ApiError';
import { errorResponse, successResponse } from '../../../utils/apiResponse';

export class SubscriptionController {
  static async createSubscription(req: Request, res: Response) {
    try {
      const dto: CreateSubscriptionDto = req.body;
      const user = req.user as User;
      const subscription = await subscriptionService.createSubscription(dto);
      const response = await SubscriptionController.formatSubscriptionResponse(subscription);

      // Create notification for subscription creation
      try {
        await notificationService.createNotification({
          type: NotificationType.PAYMENT,
          content: `Your subscription has been successfully created! Plan: ${response.plan.name}`,
          recipientId: user?.id || dto.userId,
          senderId: user?.id,
          entityType: 'subscription',
          entityId: Number(subscription.id),
        });
      } catch (error) {
        console.error('Failed to create notification for subscription creation:', error);
      }

      res.status(201).json(successResponse(response, 'Subscription created successfully'));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json(errorResponse(errorMessage));
    }
  }

  static async getSubscription(req: Request, res: Response) {
    const userDetail = req.user as User;
    const userId = userDetail?.id;

    if (!userId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }

    try {
      const subscription = await subscriptionService.getUserSubscription(userId);

      if (!subscription) {
        // Instead of returning 404, return available plans for the user to subscribe
        const availablePlans = await services.plan.getFormattedAvailablePlans();
        return res.status(200).json(
          successResponse(
            {
              hasSubscription: false,
              availablePlans,
              subscription: null,
            },
            'No active subscription found. Here are available plans:',
          ),
        );
      }

      const response = await SubscriptionController.formatSubscriptionResponse(subscription);
      res.json(
        successResponse(
          {
            hasSubscription: true,
            subscription: response,
          },
          'Subscription retrieved successfully',
        ),
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json(errorResponse(errorMessage));
    }
  }

  static async cancelSubscription(req: Request, res: Response) {
    try {
      const { subscriptionId } = req.params;
      const user = req.user as User;
      const subscription = await subscriptionService.cancelSubscription(subscriptionId);

      // Create notification for subscription cancellation
      try {
        // Get the clientId from the subscription object or use the user's ID
        const recipientId = subscription.clientId || user?.id;

        await notificationService.createNotification({
          type: NotificationType.PAYMENT,
          content: `Your subscription has been cancelled successfully.`,
          recipientId: recipientId,
          senderId: user?.id,
          entityType: 'subscription',
          entityId: Number(subscription.id),
        });
      } catch (error) {
        console.error('Failed to create notification for subscription cancellation:', error);
      }

      res.json(
        successResponse({ status: subscription.status }, 'Subscription cancelled successfully'),
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json(errorResponse(errorMessage));
    }
  }

  static async formatSubscriptionResponse(subscription: any): Promise<SubscriptionResponseDto> {
    // Get plan data if not already included
    let plan = subscription.plan;
    if (!plan) {
      plan = await services.plan.getPlanById(subscription.planId);
    }

    // Calculate credit allocation and usage
    const allocatedCredits =
      subscription.customCredits ||
      (plan && typeof plan === 'object' && plan.prices && Array.isArray(plan.prices)
        ? plan.prices[0]?.credits
        : 0) ||
      0;
    const usedCredits = subscription.baseCreditsUsed + subscription.referralCreditsUsed;

    // Format plan data for response
    const formattedPlan = {
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      features:
        typeof plan === 'object' && plan.features && Array.isArray(plan.features)
          ? plan.features.map((f: any) => ({
              name: f.feature.name,
              value: f.value,
              description: f.feature.description,
            }))
          : [],
      prices:
        typeof plan === 'object' && plan.prices && Array.isArray(plan.prices) ? plan.prices : [],
    };

    // Return formatted response
    return {
      id: subscription.id,
      status: subscription.status,
      currentPeriod: {
        start: subscription.currentPeriodStart,
        end: subscription.currentPeriodEnd,
      },
      creditUsage: {
        allocated: allocatedCredits,
        used: usedCredits,
        remaining: allocatedCredits - usedCredits,
      },
      brandUsage: {
        used: subscription.brandsUsed || 0,
      },
      plan: formattedPlan,
    };
  }
}
