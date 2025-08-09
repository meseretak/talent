import { Request, Response } from 'express';

import { ApplyDiscountDto, CreateDiscountDto, HolidayRuleDto } from '../../../types';

import logger from '../../../config/logger';
import services from '../../../services';

export class DiscountController {
  static async createDiscount(req: Request, res: Response) {
    try {
      const dto: CreateDiscountDto = req.body;
      const discount = await services.discount.createDiscount(dto);
      res.status(201).json(discount);
    } catch (error: unknown) {
      logger.error('Error creating discount:', error);
      res
        .status(400)
        .json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  }

  static async applyDiscount(req: Request, res: Response) {
    try {
      const dto: ApplyDiscountDto = req.body;
      const result = await services.discount.applyDiscount(dto.code, dto.userId, dto.applyTo);
      res.json(result);
    } catch (error: unknown) {
      logger.error('Error applying discount:', error);
      res
        .status(400)
        .json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  }

  static async addHolidayRule(req: Request, res: Response) {
    try {
      const { discountId } = req.params;
      const dto: HolidayRuleDto = req.body;
      const rule = await services.discount.addHolidayRule(discountId, dto);
      res.status(201).json(rule);
    } catch (error: unknown) {
      logger.error('Error adding holiday rule:', error);
      res
        .status(400)
        .json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  }

  static async getEligibleDiscounts(req: Request, res: Response) {
    try {
      const { userId, targetType } = req.params;
      
      // Fix: Use the discount service instead of discountEngine
      const discounts = await services.discount.getApplicableDiscounts({
        userId: parseInt(userId, 10),
        targetType,
        ...req.query,
      });
      
      res.json(discounts);
    } catch (error: unknown) {
      logger.error('Error getting eligible discounts:', error);
      res
        .status(400)
        .json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  }
}
