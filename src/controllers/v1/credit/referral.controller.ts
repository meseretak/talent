import { Request, Response } from 'express';
import { NotificationType, User } from '../../../generated/prisma';
import services from '../../../services';
import notificationService from '../../../services/communication/notification.service';
import {
  CreateReferralCreditDto,
  ReferralProgramSettingsDto,
  ReferralStatsDto,
} from '../../../types/referral';
import ApiError from '../../../utils/ApiError';
import catchAsync from '../../../utils/catchAsync';

export class ReferralController {
  static createReferral = catchAsync(async (req: Request, res: Response) => {
    const dto: CreateReferralCreditDto = {
      ...req.body,
      creditAmount: req.body.creditAmount || services.referral.creditPerReferral,
      expiresInDays: req.body.expiresInDays || services.referral.expirationDays,
    };
    const user = req.user as User;

    const referral = await services.referral.createReferralCredit(
      parseInt(dto.referrerId, 10),
      dto.referredEmail,
      dto.creditAmount || services.referral.creditPerReferral,
      dto.expiresInDays || services.referral.expirationDays,
      dto.locale,
    );

    // Create notification for referral creation
    try {
      await notificationService.createNotification({
        type: NotificationType.SYSTEM,
        content: `You have successfully created a referral for ${
          dto.referredEmail
        }. You will receive ${
          dto.creditAmount || services.referral.creditPerReferral
        } credits when they sign up!`,
        recipientId: parseInt(dto.referrerId, 10),
        senderId: user?.id,
        entityType: 'referral',
        entityId: parseInt(dto.referrerId, 10),
      });
    } catch (error) {
      console.error('Failed to create notification for referral creation:', error);
    }

    res.status(201).json({
      success: true,
      data: referral,
    });
  });

  static getReferralStats = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
      throw new ApiError(400, 'User ID is required');
    }

    const stats = await services.referral.getReferralStats(parseInt(userId, 10));
    const pendingReferrals = await services.referral.countPendingReferrals(parseInt(userId, 10));

    const response: ReferralStatsDto = {
      ...stats,
      pendingReferrals,
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  });

  static generateReferralLink = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { baseUrl, locale } = req.body;

    if (!userId) {
      throw new ApiError(400, 'User ID is required');
    }

    if (!baseUrl) {
      throw new ApiError(400, 'Base URL is required');
    }

    const referralLink = await services.referral.generateReferralLink(
      parseInt(userId, 10),
      baseUrl,
      locale,
    );

    res.status(200).json({
      success: true,
      data: { referralLink },
    });
  });

  static updateReferralSettings = catchAsync(async (req: Request, res: Response) => {
    const dto: ReferralProgramSettingsDto = req.body;
    const user = req.user as User;

    await services.referral.updateReferralSettings(dto);

    // Create notification for referral settings update
    try {
      await notificationService.createNotification({
        type: NotificationType.SYSTEM,
        content: 'Referral program settings have been updated successfully.',
        recipientId: user?.id || 0,
        senderId: user?.id,
        entityType: 'referral_settings',
        entityId: user?.id || 0,
      });
    } catch (error) {
      console.error('Failed to create notification for referral settings update:', error);
    }

    res.status(200).json({
      success: true,
      message: 'Referral program settings updated successfully',
    });
  });

  static trackReferralClick = catchAsync(async (req: Request, res: Response) => {
    const { referralCode } = req.params;
    const { ipAddress, userAgent, location } = req.body;

    if (!referralCode) {
      throw new ApiError(400, 'Referral code is required');
    }

    if (!ipAddress) {
      throw new ApiError(400, 'IP address is required');
    }

    await services.referral.trackReferralClick(referralCode, ipAddress, userAgent, location);

    res.status(200).json({
      success: true,
      message: 'Referral click tracked successfully',
    });
  });

  static completeReferral = catchAsync(async (req: Request, res: Response) => {
    const { referralLink } = req.params;
    const { newClientId } = req.body;
    const user = req.user as User;

    if (!referralLink) {
      throw new ApiError(400, 'Referral link is required');
    }

    if (!newClientId) {
      throw new ApiError(400, 'New client ID is required');
    }

    await services.referral.completeReferral(referralLink, parseInt(newClientId, 10));

    // Create notification for referral completion
    try {
      await notificationService.createNotification({
        type: NotificationType.SYSTEM,
        content: `Congratulations! Your referral has been completed successfully. You have earned referral credits!`,
        recipientId: parseInt(newClientId, 10),
        senderId: user?.id,
        entityType: 'referral',
        entityId: parseInt(newClientId, 10),
      });
    } catch (error) {
      console.error('Failed to create notification for referral completion:', error);
    }

    res.status(200).json({
      success: true,
      message: 'Referral completed successfully',
    });
  });

  static getReferralSettings = catchAsync(async (req: Request, res: Response) => {
    const settings = await services.referral.getReferralSettings();

    res.status(200).json({
      success: true,
      data: settings,
    });
  });

  static getReferralAnalytics = catchAsync(async (req: Request, res: Response) => {
    const { referralId } = req.params;
    const { startDate, endDate, groupBy } = req.query;

    if (!referralId) {
      throw new ApiError(400, 'Referral ID is required');
    }

    const analytics = await services.referral.getReferralAnalytics(parseInt(referralId, 10));

    res.status(200).json({
      success: true,
      data: analytics,
    });
  });

  static processReferralReward = catchAsync(async (req: Request, res: Response) => {
    const { referralId } = req.params;
    const user = req.user as User;

    if (!referralId) {
      throw new ApiError(400, 'Referral ID is required');
    }

    const reward = await services.referral.processReferralReward(parseInt(referralId, 10));

    // Create notification for referral reward processing
    try {
      if (reward) {
        await notificationService.createNotification({
          type: NotificationType.SYSTEM,
          content: `Your referral reward has been processed successfully! You have received ${
            reward.amount || 0
          } credits.`,
          recipientId: user?.id || 0,
          senderId: user?.id,
          entityType: 'referral_reward',
          entityId: parseInt(referralId, 10),
        });
      }
    } catch (error) {
      console.error('Failed to create notification for referral reward processing:', error);
    }

    res.status(200).json({
      success: true,
      data: reward,
      message: reward ? 'Referral reward processed successfully' : 'No reward to process',
    });
  });

  static getReferralFraudScore = catchAsync(async (req: Request, res: Response) => {
    const { referralId } = req.params;

    if (!referralId) {
      throw new ApiError(400, 'Referral ID is required');
    }

    // This would be a new method in the service to get fraud score for a specific referral
    // For now, we'll return a placeholder response
    const fraudScore = {
      score: 0,
      riskLevel: 'low' as const,
      indicators: [] as string[],
    };

    res.status(200).json({
      success: true,
      data: fraudScore,
    });
  });

  static getReferralClicks = catchAsync(async (req: Request, res: Response) => {
    const { referralId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!referralId) {
      throw new ApiError(400, 'Referral ID is required');
    }

    // This would be a new method in the service to get detailed click analytics
    const clicks: any[] = [];

    res.status(200).json({
      success: true,
      data: clicks,
      pagination: {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        total: 0,
      },
    });
  });

  static getReferralPerformance = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!userId) {
      throw new ApiError(400, 'User ID is required');
    }

    // This would be a new method in the service to get performance metrics
    const performance = {
      totalClicks: 0,
      totalSignups: 0,
      conversionRate: 0,
      averageReward: 0,
      topPerformingReferrals: [] as any[],
    };

    res.status(200).json({
      success: true,
      data: performance,
    });
  });
}
