import prisma from '../client';
import {
  BillingCycle,
  BillingEventType,
  PaymentMethodType,
  PaymentStatusType,
  Prisma,
  SubscriptionStatus,
} from '../generated/prisma';
import ApiError from '../utils/ApiError';

/**
 * Create a new subscription
 */
const createSubscription = async (data: {
  clientId: number;
  planId: string;
  priceId?: string;
  customCredits?: number;
  paymentMethod: PaymentMethodType;
}) => {
  // Check if client exists
  const client = await prisma.client.findUnique({
    where: { id: data.clientId },
  });

  if (!client) {
    throw new ApiError(404, 'Client not found');
  }

  // Check if plan exists
  const plan = await prisma.plan.findUnique({
    where: { id: data.planId },
    include: { prices: true },
  });

  if (!plan) {
    throw new ApiError(404, 'Plan not found');
  }

  // Get the price if priceId is provided, otherwise use the default price
  let price;
  if (data.priceId) {
    price = await prisma.planPrice.findUnique({
      where: { id: data.priceId },
    });

    if (!price) {
      throw new ApiError(404, 'Price not found');
    }
  } else {
    // Get the default price (monthly)
    price = plan.prices.find((p) => p.billingCycle === BillingCycle.MONTHLY);

    if (!price) {
      throw new ApiError(404, 'No default price found for this plan');
    }
  }

  // Calculate period dates
  const currentDate = new Date();
  const currentPeriodStart = currentDate;

  // Set end date based on billing cycle
  let currentPeriodEnd;
  if (price.billingCycle === BillingCycle.MONTHLY) {
    currentPeriodEnd = new Date(currentDate);
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
  } else if (price.billingCycle === BillingCycle.ANNUALLY) {
    currentPeriodEnd = new Date(currentDate);
    currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
  } else {
    // Default to 30 days
    currentPeriodEnd = new Date(currentDate);
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);
  }

  // Create subscription
  const subscription = await prisma.subscription.create({
    data: {
      client: { connect: { id: data.clientId } },
      plan: { connect: { id: data.planId } },
      price: data.priceId ? { connect: { id: data.priceId } } : undefined,
      customCredits: data.customCredits,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart,
      currentPeriodEnd,
      // Create initial subscription history record
      subscriptionHistory: {
        create: {
          planId: data.planId,
          priceId: data.priceId,
          status: SubscriptionStatus.ACTIVE,
          startDate: currentPeriodStart,
          endDate: currentPeriodEnd,
        },
      },
      // Create initial invoice
      invoice: {
        create: {
          amount: Number(price.amount),
          totalAmount: Number(price.amount), // Without taxes or discounts initially
          status: PaymentStatusType.PENDING,
          issuedAt: currentDate,
          dueDate: new Date(currentDate.setDate(currentDate.getDate() + 7)),
          invoiceNumber: `INV-${Date.now()}`,
          invoiceItems: {
            create: {
              description: `Subscription to ${plan.name} plan (${price.billingCycle})`,
              quantity: 1,
              unitPrice: price.amount,
              amount: price.amount,
              taxable: true,
            },
          },
        },
      },
    },
    include: {
      client: true,
      plan: true,
      price: true,
      invoice: {
        include: {
          invoiceItems: true,
        },
      },
      subscriptionHistory: true,
    },
  });

  return subscription;
};

/**
 * Renew a subscription for the next billing period
 */
const renewSubscription = async (subscriptionId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      client: true,
      plan: true,
      price: true,
    },
  });

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  if (subscription.status !== SubscriptionStatus.ACTIVE) {
    throw new ApiError(400, 'Cannot renew an inactive subscription');
  }

  // Calculate new period dates
  const newPeriodStart = new Date(subscription.currentPeriodEnd);
  let newPeriodEnd;

  if (subscription.price?.billingCycle === BillingCycle.MONTHLY) {
    newPeriodEnd = new Date(newPeriodStart);
    newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
  } else if (subscription.price?.billingCycle === BillingCycle.ANNUALLY) {
    newPeriodEnd = new Date(newPeriodStart);
    newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
  } else {
    // Default to 30 days
    newPeriodEnd = new Date(newPeriodStart);
    newPeriodEnd.setDate(newPeriodEnd.getDate() + 30);
  }

  // Create new invoice
  const invoice = await prisma.invoice.create({
    data: {
      subscription: { connect: { id: subscription.id } },
      amount: subscription.price ? Number(subscription.price.amount) : 0,
      totalAmount: subscription.price ? Number(subscription.price.amount) : 0,
      status: PaymentStatusType.PENDING,
      issuedAt: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      invoiceNumber: `INV-${Date.now()}`,
      invoiceItems: {
        create: {
          description: `Renewal of ${subscription.plan.name} plan`,
          quantity: 1,
          unitPrice: subscription.price?.amount || 0,
          amount: subscription.price?.amount || 0,
          taxable: true,
        },
      },
    },
  });

  // Update subscription
  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      currentPeriodStart: newPeriodStart,
      currentPeriodEnd: newPeriodEnd,
      // Reset usage counters if needed
      baseCreditsUsed: 0,
      referralCreditsUsed: 0,
      // Add subscription history record
      subscriptionHistory: {
        create: {
          planId: subscription.planId,
          priceId: subscription.priceId,
          status: SubscriptionStatus.ACTIVE,
          startDate: newPeriodStart,
          endDate: newPeriodEnd,
          reason: 'Subscription renewal',
        },
      },
    },
    include: {
      client: true,
      plan: true,
      price: true,
      invoice: {
        include: {
          invoiceItems: true,
        },
      },
      subscriptionHistory: true,
    },
  });

  return { subscription: updatedSubscription, invoice };
};

/**
 * Cancel a subscription
 */
const cancelSubscription = async (subscriptionId: string, reason?: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  // Update subscription status
  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: SubscriptionStatus.CANCELED, // Fixed: CANCELLED → CANCELED
      // Add subscription history record
      subscriptionHistory: {
        create: {
          planId: subscription.planId,
          priceId: subscription.priceId,
          status: SubscriptionStatus.CANCELED, // Fixed: CANCELLED → CANCELED
          startDate: subscription.currentPeriodStart,
          endDate: subscription.currentPeriodEnd,
          reason: reason || 'Subscription cancelled by user',
        },
      },
    },
    include: {
      client: true,
      plan: true,
      price: true,
      subscriptionHistory: true,
    },
  });

  return updatedSubscription;
};

/**
 * Upgrade or downgrade a subscription to a different plan
 */
const changePlan = async (
  subscriptionId: string,
  data: {
    newPlanId: string;
    newPriceId?: string;
    reason?: string;
    prorated?: boolean;
  },
) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      client: true,
      plan: true,
      price: true,
    },
  });

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  // Check if new plan exists
  const newPlan = await prisma.plan.findUnique({
    where: { id: data.newPlanId },
    include: { prices: true },
  });

  if (!newPlan) {
    throw new ApiError(404, 'New plan not found');
  }

  // Get the new price
  let newPrice;
  if (data.newPriceId) {
    newPrice = await prisma.planPrice.findUnique({
      where: { id: data.newPriceId },
    });

    if (!newPrice) {
      throw new ApiError(404, 'New price not found');
    }
  } else {
    // Use the same billing cycle as the current subscription if possible
    const currentBillingCycle = subscription.price?.billingCycle || BillingCycle.MONTHLY;
    newPrice = newPlan.prices.find((p) => p.billingCycle === currentBillingCycle);

    if (!newPrice) {
      // Fallback to monthly
      newPrice = newPlan.prices.find((p) => p.billingCycle === BillingCycle.MONTHLY);

      if (!newPrice) {
        throw new ApiError(404, 'No compatible price found for the new plan');
      }
    }
  }

  // Calculate prorated amount if needed
  let proratedAmount = 0;
  if (data.prorated && subscription.price) {
    const currentDate = new Date();
    const totalDays =
      (subscription.currentPeriodEnd.getTime() - subscription.currentPeriodStart.getTime()) /
      (1000 * 60 * 60 * 24);
    const remainingDays =
      (subscription.currentPeriodEnd.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
    const remainingRatio = remainingDays / totalDays;

    // Calculate refund for current plan
    const refundAmount = Number(subscription.price.amount) * remainingRatio;

    // Calculate charge for new plan
    const newPlanAmount = Number(newPrice.amount) * remainingRatio;

    // Final prorated amount (can be positive or negative)
    proratedAmount = newPlanAmount - refundAmount;
  }

  // Update subscription
  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      plan: { connect: { id: data.newPlanId } },
      price: { connect: { id: newPrice.id } },
      // Removed: planId and priceId direct assignments
      // Add subscription history record
      subscriptionHistory: {
        create: {
          planId: data.newPlanId,
          priceId: newPrice.id,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
          endDate: subscription.currentPeriodEnd,
          reason: data.reason || `Changed plan from ${subscription.plan.name} to ${newPlan.name}`,
        },
      },
    },
    include: {
      client: true,
      plan: true,
      price: true,
      subscriptionHistory: true,
    },
  });

  // Create invoice for plan change if there's a prorated amount
  let invoice = null;
  if (proratedAmount !== 0) {
    invoice = await prisma.invoice.create({
      data: {
        subscription: { connect: { id: subscription.id } },
        amount: Math.abs(proratedAmount),
        totalAmount: Math.abs(proratedAmount),
        status: proratedAmount > 0 ? PaymentStatusType.PENDING : PaymentStatusType.PAID,
        issuedAt: new Date(),
        dueDate:
          proratedAmount > 0 ? new Date(new Date().setDate(new Date().getDate() + 7)) : new Date(),
        invoiceNumber: `INV-${Date.now()}`,
        invoiceItems: {
          create: {
            description:
              proratedAmount > 0
                ? `Prorated charge for changing to ${newPlan.name} plan`
                : `Prorated credit for changing from ${subscription.plan.name} plan`,
            quantity: 1,
            unitPrice: new Prisma.Decimal(Math.abs(proratedAmount)),
            amount: new Prisma.Decimal(Math.abs(proratedAmount)),
            taxable: true,
          },
        },
      },
    });
  }

  return { subscription: updatedSubscription, invoice, proratedAmount };
};

/**
 * Process a payment for a subscription invoice
 */
const processSubscriptionPayment = async (
  invoiceId: number,
  data: {
    paymentMethod: PaymentMethodType;
    transactionDetails: string;
    amount?: number;
  },
) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      subscription: true,
    },
  });

  if (!invoice) {
    throw new ApiError(404, 'Invoice not found');
  }

  if (invoice.status === PaymentStatusType.PAID) {
    throw new ApiError(400, 'Invoice has already been paid');
  }

  // Create payment transaction
  const paymentTransaction = await prisma.paymentTransaction.create({
    data: {
      amount: new Prisma.Decimal(data.amount || invoice.totalAmount),
      status: PaymentStatusType.PAID,
      paymentMethod: data.paymentMethod,
      paymentReference: data.transactionDetails,
      description: `Payment for invoice #${invoice.invoiceNumber}`,
      type: 'SUBSCRIPTION', // Add the required type field
      client: { connect: { id: invoice.subscription.clientId } },
      invoice: { connect: { id: invoiceId } },
      subscription: { connect: { id: invoice.subscription.id } },
    },
  });

  // Update invoice status
  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: PaymentStatusType.PAID,
    },
    include: {
      subscription: true,
      paymentTransactions: true,
    },
  });

  // In the processSubscriptionPayment function:
  // Create billing history record
  await prisma.billingHistory.create({
    data: {
      client: { connect: { id: invoice.subscription.clientId } },
      subscription: { connect: { id: invoice.subscription.id } },
      invoice: { connect: { id: invoiceId } },
      paymentTransaction: { connect: { id: paymentTransaction.id } },
      eventType: BillingEventType.PAYMENT_SUCCEEDED, // Updated to use the correct enum value
      amount: new Prisma.Decimal(data.amount || invoice.totalAmount),
      description: `Payment received for invoice #${invoice.invoiceNumber}`,
    },
  });

  return { invoice: updatedInvoice, paymentTransaction };
};

/**
 * Get subscription details
 */
const getSubscription = async (subscriptionId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
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
      invoice: {
        orderBy: {
          issuedAt: 'desc',
        },
        take: 5,
      },
      subscriptionHistory: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      creditConsumptions: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
    },
  });

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  return subscription;
};

/**
 * Get client's active subscription
 */
const getClientSubscription = async (clientId: number) => {
  const subscription = await prisma.subscription.findFirst({
    where: {
      clientId,
      status: SubscriptionStatus.ACTIVE,
    },
    include: {
      plan: true,
      price: true,
      invoice: {
        orderBy: {
          issuedAt: 'desc',
        },
        take: 1,
      },
    },
  });

  return subscription;
};

/**
 * Get subscription usage statistics
 */
const getSubscriptionUsage = async (subscriptionId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      plan: true,
      price: true,
      creditConsumptions: true,
    },
  });

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  // Get total credits from plan
  const totalCredits = subscription.price?.credits || 0;
  const customCredits = subscription.customCredits || 0;
  const availableCredits = totalCredits + customCredits - subscription.baseCreditsUsed;

  // Calculate usage by service type
  const usageByService = await prisma.creditConsumption.groupBy({
    by: ['serviceId'],
    where: {
      subscriptionId,
    },
    _sum: {
      totalCredits: true,
    },
  });

  // Get service names
  const serviceIds = usageByService.map((u) => u.serviceId).filter((id) => id !== null) as string[];
  const services =
    serviceIds.length > 0
      ? await prisma.creditValue.findMany({
          where: {
            id: {
              in: serviceIds,
            },
          },
        })
      : [];

  // Map service names to usage
  const usageWithServiceNames = usageByService.map((usage) => {
    const service = services.find((s) => s.id === usage.serviceId);
    return {
      serviceId: usage.serviceId,
      serviceName: service?.name || 'Unknown',
      serviceType: service?.serviceType || 'Unknown',
      creditsUsed: usage._sum.totalCredits || 0,
    };
  });

  return {
    totalCredits: totalCredits + customCredits,
    usedCredits: subscription.baseCreditsUsed,
    availableCredits,
    usagePercentage:
      totalCredits > 0 ? (subscription.baseCreditsUsed / (totalCredits + customCredits)) * 100 : 0,
    usageByService: usageWithServiceNames,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    daysLeft: Math.ceil(
      (subscription.currentPeriodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    ),
  };
};

export default {
  createSubscription,
  renewSubscription,
  cancelSubscription,
  changePlan,
  processSubscriptionPayment,
  getSubscription,
  getClientSubscription,
  getSubscriptionUsage,
};
