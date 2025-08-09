import { PrismaClient } from '../../generated/prisma';

export class DiscountEngine {
  constructor(private prisma: PrismaClient) {}

  async getApplicableDiscounts(context: {
    userId: string;
    targetType: 'PLANS' | 'SERVICES';
    planId?: string;
    serviceType?: string;
  }) {
    const now = new Date();
    return this.prisma.discount.findMany({
      where: {
        AND: [
          { isActive: true },
          { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
          { OR: [{ validUntil: null }, { validUntil: { gte: now } }] },
          { appliesTo: context.targetType },
        ],
      },
      include: {
        holidayRules: {
          where: {
            OR: [
              { isRecurring: true, date: { equals: now } },
              { isRecurring: false, date: { gte: now } },
            ],
          },
        },
      },
    });
  }
}
