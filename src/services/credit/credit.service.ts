import { CreditType, PrismaClient } from '../../generated/prisma';
import { CreditBalanceDto, CreditConsumptionDto } from '../../types';

export class CreditService {
  constructor(private prisma: PrismaClient) {}

  async getCreditBalance(subscriptionId: string): Promise<CreditBalanceDto> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: {
          include: {
            prices: true,
          },
        },
        referralCredits: {
          where: {
            status: 'ACTIVE',
            expiresAt: { gt: new Date() },
          },
        },
      },
    });

    if (!subscription) throw new Error('Subscription not found');

    // Fix: Access the billing cycle from the subscription's priceId relation
    const baseCredits =
      subscription.plan.prices.find((p) => p.id === subscription.priceId)?.credits || 0;

    const referralCredits = subscription.referralCredits.reduce(
      (sum, credit) => sum + credit.creditAmount,
      0,
    );

    const availableBaseCredits = baseCredits - subscription.baseCreditsUsed;
    const availableReferralCredits = referralCredits - subscription.referralCreditsUsed;
    const availableCredits = availableBaseCredits + availableReferralCredits;

    return {
      baseCredits,
      baseCreditsUsed: subscription.baseCreditsUsed,
      referralCredits,
      referralCreditsUsed: subscription.referralCreditsUsed,
      availableCredits,
    };
  }

  async consumeCredits(
    subscriptionId: string,
    serviceId: string,
    units: number,
    description?: string,
  ): Promise<CreditConsumptionDto> {
    return this.prisma.$transaction(async (tx) => {
      const service = await tx.creditValue.findUnique({
        where: { id: serviceId },
      });

      if (!service) throw new Error('Service not found');

      const totalCost = service.creditsPerUnit * units;
      const balance = await this.getCreditBalance(subscriptionId);

      if (balance.availableCredits < totalCost) {
        throw new Error('Insufficient credits');
      }

      // Determine which credits to use (referral first, then base)
      let referralCreditsToUse = 0;
      let baseCreditsToUse = 0;
      const availableReferralCredits = balance.referralCredits - balance.referralCreditsUsed;

      if (availableReferralCredits > 0) {
        referralCreditsToUse = Math.min(availableReferralCredits, totalCost);
        baseCreditsToUse = totalCost - referralCreditsToUse;
      } else {
        baseCreditsToUse = totalCost;
      }

      // Update subscription credit usage
      await tx.subscription.update({
        where: { id: subscriptionId },
        data: {
          referralCreditsUsed: { increment: referralCreditsToUse },
          baseCreditsUsed: { increment: baseCreditsToUse },
        },
      });

      // Create consumption record
      const creditType = referralCreditsToUse > 0 ? CreditType.REFERRAL : CreditType.BASE;

      const consumption = await tx.creditConsumption.create({
        data: {
          subscription: { connect: { id: subscriptionId } },
          service: { connect: { id: serviceId } },
          units,
          unitType: service.baseUnit,
          creditRate: service.creditsPerUnit,
          totalCredits: totalCost,
          creditType,
          description,
        },
      });

      // Fix: Convert Prisma result to match CreditConsumptionDto
      return {
        subscriptionId,
        serviceId,
        units,
        description: consumption.description || undefined,
      };
    });
  }

  // Add a method to track referral credit usage specifically
  async consumeReferralCredit(
    subscriptionId: string,
    referralCreditId: string,
    amount: number,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const referralCredit = await tx.referralCredit.findUnique({
        where: { id: referralCreditId },
      });

      if (
        !referralCredit ||
        referralCredit.status !== 'ACTIVE' ||
        referralCredit.expiresAt < new Date()
      ) {
        throw new Error('Invalid or expired referral credit');
      }

      // Update the referral credit status if fully consumed
      await tx.referralCredit.update({
        where: { id: referralCreditId },
        data: {
          status: 'USED',
        },
      });

      // Create a consumption record linked to this specific referral credit
      await tx.creditConsumption.create({
        data: {
          subscription: { connect: { id: subscriptionId } },
          units: 1, // Symbolic unit
          unitType: 'CREDIT',
          creditRate: amount,
          totalCredits: amount,
          creditType: CreditType.REFERRAL,
          referralCredit: { connect: { id: referralCreditId } },
          description: 'Referral credit redemption',
        },
      });
    });
  }
}
