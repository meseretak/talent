import { Request, Response } from 'express';
import { NotificationType, User } from '../../../generated/prisma';
import { services } from '../../../services';
import notificationService from '../../../services/communication/notification.service';
import {
  CreditBalanceDto,
  CreditConsumptionDto,
  ServiceCostCalculationDto,
  ServiceCostResultDto,
} from '../../../types';

export class CreditController {
  static async getCreditBalance(req: Request, res: Response) {
    try {
      const { subscriptionId } = req.params;
      const balance = await services.credit.getCreditBalance(subscriptionId);

      const response: CreditBalanceDto = {
        ...balance,
        availableCredits:
          balance.baseCredits -
          balance.baseCreditsUsed +
          balance.referralCredits -
          balance.referralCreditsUsed,
      };

      res.json(response);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  static async calculateServiceCost(req: Request, res: Response) {
    try {
      const dto: ServiceCostCalculationDto = req.body;
      const result = await services.creditValue.getServiceCost(dto.serviceType, dto.units);

      const response: ServiceCostResultDto = {
        ...result,
        unitType: (await services.creditValue.getCreditValue(dto.serviceType))?.baseUnit || 'UNIT',
      };

      res.json(response);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  static async consumeCredits(req: Request, res: Response) {
    try {
      const dto: CreditConsumptionDto = req.body;
      const user = req.user as User;
      const consumption = await services.credit.consumeCredits(
        dto.subscriptionId,
        dto.serviceId,
        dto.units,
      );

      // Create notification for credit consumption
      try {
        await notificationService.createNotification({
          type: NotificationType.PAYMENT,
          content: `You have consumed ${dto.units} credits for service ${dto.serviceId}.`,
          recipientId: user?.id || Number(dto.subscriptionId),
          senderId: user?.id,
          entityType: 'credit_consumption',
          entityId: Number(dto.subscriptionId),
        });
      } catch (error) {
        console.error('Failed to create notification for credit consumption:', error);
      }

      res.status(201).json(consumption);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }
}
