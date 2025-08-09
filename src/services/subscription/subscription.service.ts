import Stripe from 'stripe';
import { stripe } from '../../config/stripe';
import {
  BillingCycle,
  BrandConsumption,
  CreditTransaction,
  PrismaClient,
  Subscription,
  SubscriptionStatus,
} from '../../generated/prisma';

import generateEmailHTML from '../../template/email';
import ApiError from '../../utils/ApiError';
import { DateUtils } from '../../utils/dateUtils';
import emailService from '../communication/email.service';

// Current implementation
const prisma = new PrismaClient();

// Define DTO for subscription creation
interface CreateSubscriptionDto {
  userId: number;
  planId: string;
  priceId?: string;
  customCredits?: number;
  status?: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  billingCycle?: BillingCycle;
}

export class SubscriptionService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  // Email Service Methods
  private async sendSubscriptionEmail(
    subscription: Subscription,
    session: Stripe.Checkout.Session,
  ) {
    const subscriptionWithRelations = await this.getSubscriptionWithRelations(subscription.id);
    const client = subscriptionWithRelations.client;

    const subject = 'Subscription Confirmation';
    const text = `Thank you for subscribing to ${subscriptionWithRelations.plan.name}`;
    const htmlContent = generateEmailHTML('subscription_confirmation', {
      name: `${client.user.firstName} ${client.user.lastName}`,
      subscriptionPlan: subscriptionWithRelations.plan.name,
      credits:
        subscriptionWithRelations.customCredits || subscriptionWithRelations.price?.credits || 0,
      brandSlots:
        subscriptionWithRelations.plan.features.find((f) => f.feature.key === 'brands')?.value ||
        '0',
      validUntil: DateUtils.formatForDisplay(subscriptionWithRelations.currentPeriodEnd),
      transactionId: session.id,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency?.toUpperCase(),
      dashboardLink: `${process.env.FRONTEND_URL}/dashboard/subscriptions`,
    });

    await emailService.sendEmail(client.user.email, subject, text, htmlContent);
  }

  private async sendCreditAllocationEmail(subscriptionId: string, amount: number) {
    const subscriptionWithRelations = await this.getSubscriptionWithRelations(subscriptionId);
    const client = subscriptionWithRelations.client;

    const subject = 'Credits Added to Your Account';
    const text = `${amount} credits have been added to your account`;
    const htmlContent = generateEmailHTML('credit_allocation', {
      name: `${client.user.firstName} ${client.user.lastName}`,
      credits: amount,
      remainingCredits:
        (subscriptionWithRelations.price?.credits || 0) - subscriptionWithRelations.baseCreditsUsed,
      transactionId: subscriptionWithRelations.id,
      dashboardLink: `${process.env.FRONTEND_URL}/dashboard/credits`,
    });

    await emailService.sendEmail(client.user.email, subject, text, htmlContent);
  }

  // Helper Methods
  private async getSubscriptionWithRelations(subscriptionId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
            },
          },
        },
        price: true,
      },
    });

    if (!subscription) throw new ApiError(404, 'Subscription not found');
    if (!subscription.client) throw new ApiError(404, 'Client not found');

    return subscription;
  }

  private validateSubscriptionData(data: CreateSubscriptionDto): void {
    if (!data.userId) {
      throw new ApiError(400, 'User ID is required');
    }

    if (!data.planId) {
      throw new ApiError(400, 'Plan ID is required');
    }
  }

  // Main Service Methods
  async createSubscription(data: CreateSubscriptionDto): Promise<Subscription> {
    // Validate input data
    this.validateSubscriptionData(data);

    console.log('Creating subscription for userId:', data.userId);

    // Check if client exists
    const client = await prisma.client.findFirst({
      where: { user: { id: data.userId } },
      include: { subscription: true },
    });

    console.log('Found client:', client ? { id: client.id, userId: client.userId } : 'Not found');

    if (!client) {
      throw new ApiError(
        404,
        'Client not found. Please ensure the user exists and is registered as a client.',
      );
    }

    // Check if client already has an active subscription
    if (client.subscription) {
      throw new ApiError(400, 'Client already has an active subscription.');
    }

    // Set default values if not provided
    const currentPeriodStart = data.currentPeriodStart || DateUtils.getCurrentDate();
    const currentPeriodEnd =
      data.currentPeriodEnd ||
      DateUtils.calculatePeriodEnd(data.billingCycle || 'MONTHLY', currentPeriodStart);

    return prisma.subscription.create({
      data: {
        client: { connect: { id: client.id } },
        plan: { connect: { id: data.planId } },
        price: data.priceId ? { connect: { id: data.priceId } } : undefined,
        customCredits: data.customCredits,
        status: data.status || 'ACTIVE',
        currentPeriodStart,
        currentPeriodEnd,
        baseCreditsUsed: 0,
        referralCreditsUsed: 0,
        brandsUsed: 0,
      },
      include: {
        plan: {
          include: {
            prices: true,
            features: {
              include: {
                feature: true,
              },
            },
          },
        },
      },
    });
  }

  async getUserSubscription(userId: number): Promise<Subscription | null> {
    return prisma.subscription.findFirst({
      where: {
        client: {
          userId: userId,
        },
        status: 'ACTIVE',
      },
      include: {
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
            },
            prices: true,
          },
        },
        creditConsumptions: true,
        brandConsumptions: true,
      },
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    // First check if subscription exists
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new ApiError(404, 'Subscription not found');
    }

    // Create subscription history record
    await prisma.subscriptionHistory.create({
      data: {
        subscription: { connect: { id: subscriptionId } },
        planId: subscription.planId,
        priceId: subscription.priceId,
        status: 'CANCELED',
        startDate: subscription.currentPeriodStart,
        endDate: new Date(),
        reason: 'User requested cancellation',
      },
    });

    // Update subscription status
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'CANCELED' },
    });
  }

  async purchasePackage(clientId: number, planId: string): Promise<Subscription> {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        prices: {
          where: { isActive: true },
        },
        features: {
          include: { feature: true },
        },
      },
    });

    if (!plan) throw new ApiError(404, 'Plan not found');
    if (!plan.prices.length) throw new ApiError(400, 'No active prices found for this plan');

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { user: true },
    });

    if (!client) throw new ApiError(404, 'Client not found');

    const session = await this.createStripeSession(plan, client);
    const subscription = await this.createSubscriptionRecord(clientId, plan);
    await this.sendSubscriptionEmail(subscription, session);

    return subscription;
  }

  private async createStripeSession(plan: any, client: any) {
    return stripe.checkout.sessions.create({
      customer_email: client.user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.description || undefined,
            },
            unit_amount: Math.round(Number(plan.prices[0].amount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: {
        clientId: client.id.toString(),
        planId: plan.id,
        priceId: plan.prices[0].id,
      },
    });
  }

  private async createSubscriptionRecord(clientId: number, plan: any) {
    // Get the billing cycle from the plan's first price
    const billingCycle = plan.prices[0]?.billingCycle || 'MONTHLY';
    const currentPeriodStart = DateUtils.getCurrentDate();
    const currentPeriodEnd = DateUtils.calculatePeriodEnd(billingCycle, currentPeriodStart);

    return prisma.subscription.create({
      data: {
        client: { connect: { id: clientId } },
        plan: { connect: { id: plan.id } },
        price: { connect: { id: plan.prices[0].id } },
        status: 'TRIALING',
        currentPeriodStart,
        currentPeriodEnd,
        customCredits: plan.isCustom ? plan.prices[0].credits : null,
        baseCreditsUsed: 0,
        referralCreditsUsed: 0,
        brandsUsed: 0,
      },
      include: {
        client: true,
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
            },
          },
        },
        price: true,
      },
    });
  }

  async allocateCredits(subscriptionId: string, amount: number): Promise<CreditTransaction> {
    const subscription = await this.getSubscriptionWithRelations(subscriptionId);

    const transaction = await prisma.creditTransaction.create({
      data: {
        client: { connect: { id: subscription.clientId } },
        subscription: { connect: { id: subscriptionId } },
        amount,
        type: 'SUBSCRIPTION',
        description: `Credits allocated from ${subscription.plan.name} plan purchase`,
        remaining: (subscription.price?.credits || 0) + amount,
      },
    });

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        baseCreditsUsed: 0,
        status: 'ACTIVE',
      },
    });

    await this.sendCreditAllocationEmail(subscriptionId, amount);
    return transaction;
  }

  async manageBrandSlots(
    subscriptionId: string,
    action: 'add' | 'remove',
    brandId: string,
  ): Promise<BrandConsumption> {
    const subscription = await this.getSubscriptionWithRelations(subscriptionId);

    const brandLimit = subscription.plan.features.find((f) => f.feature.key === 'brands')?.value;

    if (!brandLimit) throw new ApiError(400, 'No brand slot limit defined for this plan');
    if (action === 'add' && subscription.brandsUsed >= parseInt(brandLimit)) {
      throw new ApiError(400, 'Brand slot limit reached');
    }

    // Create brand consumption record
    const consumption = await prisma.brandConsumption.create({
      data: {
        subscription: { connect: { id: subscriptionId } },
        brandId, // This is the project ID
        action,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days expiry
      },
    });

    // Update subscription brand usage count
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        brandsUsed: action === 'add' ? { increment: 1 } : { decrement: 1 },
      },
    });

    return consumption;
  }

  // New methods for subscription management
  async upgradeSubscription(subscriptionId: string, newPlanId: string): Promise<Subscription> {
    // Use transaction to ensure all operations succeed or fail together
    return this.prisma.$transaction(async (tx) => {
      const subscription = await this.getSubscriptionWithRelations(subscriptionId);
      const newPlan = await tx.plan.findUnique({
        where: { id: newPlanId },
        include: {
          prices: { where: { isActive: true } },
          features: { include: { feature: true } },
        },
      });

      if (!newPlan) throw new ApiError(404, 'New plan not found');

      // Create history record
      await tx.subscriptionHistory.create({
        data: {
          subscription: { connect: { id: subscriptionId } },
          planId: subscription.planId,
          priceId: subscription.priceId,
          status: subscription.status,
          startDate: subscription.currentPeriodStart,
          endDate: new Date(),
          reason: 'Plan upgrade',
        },
      });

      // Update subscription
      return tx.subscription.update({
        where: { id: subscriptionId },
        data: {
          plan: { connect: { id: newPlanId } },
          price: { connect: { id: newPlan.prices[0].id } },
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          customCredits: newPlan.isCustom ? newPlan.prices[0].credits : null,
          baseCreditsUsed: 0, // Reset usage for new plan
        },
        include: {
          client: {
            include: {
              user: true,
            },
          },
          plan: {
            include: {
              features: {
                include: {
                  feature: true,
                },
              },
            },
          },
          price: true,
        },
      });
    });
  }

  async renewSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.getSubscriptionWithRelations(subscriptionId);

    // Calculate new period dates
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date(currentPeriodStart);

    // Determine billing cycle from price
    const billingCycle = subscription.price?.billingCycle || 'MONTHLY';
    if (billingCycle === 'ANNUALLY') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    // Create history record for previous period
    await prisma.subscriptionHistory.create({
      data: {
        subscription: { connect: { id: subscriptionId } },
        planId: subscription.planId,
        priceId: subscription.priceId,
        status: subscription.status,
        startDate: subscription.currentPeriodStart,
        endDate: new Date(),
        reason: 'Subscription renewal',
      },
    });

    // Update subscription with new period
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        currentPeriodStart,
        currentPeriodEnd,
        baseCreditsUsed: 0, // Reset usage for new period
      },
      include: {
        client: true,
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
            },
          },
        },
        price: true,
      },
    });

    // Get client with user information
    const clientWithUser = await prisma.client.findUnique({
      where: { id: updatedSubscription.clientId },
      include: { user: true },
    });

    if (!clientWithUser || !clientWithUser.user) {
      throw new ApiError(404, 'Client or user information not found');
    }
    // Send renewal confirmation email
    const subject = 'Subscription Renewed';
    const text = `Your subscription to ${updatedSubscription.plan.name} has been renewed`;
    const htmlContent = generateEmailHTML('subscription_renewal', {
      name: `${clientWithUser.user.firstName} ${clientWithUser.user.lastName}`,
      subscriptionPlan: updatedSubscription.plan.name,
      credits: updatedSubscription.customCredits || updatedSubscription.price?.credits || 0,
      validUntil: updatedSubscription.currentPeriodEnd.toLocaleDateString(),
      dashboardLink: `${process.env.FRONTEND_URL}/dashboard/subscriptions`,
    });

    await emailService.sendEmail(clientWithUser.user.email, subject, text, htmlContent);
    return updatedSubscription;
  }

  async getSubscriptionHistory(subscriptionId: string) {
    return prisma.subscriptionHistory.findMany({
      where: { subscriptionId },
      orderBy: { endDate: 'desc' },
    });
  }

  async getClientSubscriptions(clientId: number) {
    return prisma.subscription.findMany({
      where: { clientId },
      include: {
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
            },
          },
        },
        price: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async checkSubscriptionStatus(subscriptionId: string): Promise<boolean> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new ApiError(404, 'Subscription not found');
    }

    // Check if subscription is active and not expired
    const isActive = subscription.status === 'ACTIVE' || subscription.status === 'TRIALING';
    const isExpired = subscription.currentPeriodEnd < new Date();

    if (isActive && isExpired) {
      // Auto-update expired subscription to inactive
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'EXPIRED' },
      });
      return false;
    }

    return isActive && !isExpired;
  }
}

export default new SubscriptionService(prisma);
