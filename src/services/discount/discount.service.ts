import { Discount, HolidayDiscountRule, PrismaClient } from '../../generated/prisma';
import { CreateDiscountDto, HolidayRuleDto } from '../../types';

export class DiscountService {
  constructor(private prisma: PrismaClient) {}

  async createDiscount(data: CreateDiscountDto): Promise<Discount> {
    return this.prisma.discount.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        type: data.type,
        value: data.value,
        maxDiscount: data.maxDiscount,
        minRequirement: data.minRequirement,
        appliesTo: data.appliesTo,
        planIds: data.planIds,
        serviceTypes: data.serviceTypes,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        schedule: data.schedule,
        timezone: data.timezone,
        maxUses: data.maxUses,
        userMaxUses: data.userMaxUses,
      },
    });
  }

  async addHolidayRule(discountId: string, data: HolidayRuleDto): Promise<HolidayDiscountRule> {
    return this.prisma.holidayDiscountRule.create({
      data: {
        discount: { connect: { id: discountId } },
        holidayName: data.holidayName,
        date: data.date,
        isRecurring: data.isRecurring ?? true,
        multiplier: data.multiplier ?? 1.5,
      },
    });
  }

  async applyDiscount(
    discountCode: string,
    userId: number,
    applyTo: { subscriptionId?: string; serviceId?: string },
  ): Promise<{ success: boolean; discountAmount: number }> {
    // Implementation depends on your specific discount logic
    const discount = await this.prisma.discount.findUnique({
      where: { code: discountCode },
    });

    if (!discount) {
      throw new Error('Discount not found');
    }

    // Record the redemption - Fixed structure to match Prisma expectations
    const redemptionData: any = {
      discount: { connect: { id: discount.id } },
      client: { connect: { id: userId } },
      appliedTo: applyTo.subscriptionId ? 'subscription' : 'service',
      appliedAmount: 0, // Will be calculated
    };

    if (applyTo.subscriptionId) {
      redemptionData.subscription = { connect: { id: applyTo.subscriptionId } };
    }

    if (applyTo.serviceId) {
      redemptionData.creditValue = { connect: { id: applyTo.serviceId } };
    }

    await this.prisma.discountRedemption.create({
      data: redemptionData,
    });

    return {
      success: true,
      discountAmount: 0, // Implement your calculation logic
    };
  }

  async getApplicableDiscounts(params: {
    userId: number;
    targetType: string;
    [key: string]: any;
  }): Promise<Discount[]> {
    const { userId, targetType, ...filters } = params;

    // Get current date for validation
    const now = new Date();

    // First, get all potentially applicable discounts
    const potentialDiscounts = await this.prisma.discount.findMany({
      where: {
        // Time validity
        validFrom: { lte: now },
        validUntil: { gte: now },

        // Target type match
        appliesTo: targetType as any, // Cast to any to fix type error

        // Add any additional filters
        ...filters,
      },
    });

    // Then filter them based on usage limits
    const applicableDiscounts = [];

    for (const discount of potentialDiscounts) {
      // Check global usage limit
      if (discount.maxUses !== null) {
        const usageCount = await this.prisma.discountRedemption.count({
          where: { discountId: discount.id },
        });

        if (usageCount >= discount.maxUses) {
          continue; // Skip this discount
        }
      }

      // Check per-user usage limit
      if (discount.userMaxUses !== null) {
        const userUsageCount = await this.prisma.discountRedemption.count({
          where: {
            discountId: discount.id,
            clientId: userId,
          },
        });

        if (userUsageCount >= discount.userMaxUses) {
          continue; // Skip this discount
        }
      }

      // If we got here, the discount is applicable
      applicableDiscounts.push(discount);
    }

    return applicableDiscounts;
  }
}
