import Stripe from 'stripe';
import { stripe } from '../../config/stripe';
import {
  CustomPlanRequest,
  PaymentStatusType,
  PaymentTransaction,
  PrismaClient,
  TransactionType,
} from '../../generated/prisma';
import generateEmailHTML from '../../template/email';
import ApiError from '../../utils/ApiError';
import { DateUtils } from '../../utils/dateUtils';
import emailService from '../communication/email.service';
import { SubscriptionService } from './subscription.service';

// Current implementation
const prisma = new PrismaClient();

export class PaymentService {
  private prisma: typeof prisma;
  private subscriptionService: SubscriptionService;

  constructor(prismaClient: typeof prisma) {
    this.prisma = prismaClient;
    this.subscriptionService = new SubscriptionService(prismaClient);
  }

  /**
   * Get payment history for a client
   * @param clientId The ID of the client
   * @returns Array of payment transactions
   */
  async getClientPaymentHistory(clientId: number): Promise<PaymentTransaction[]> {
    const transactions = await this.prisma.paymentTransaction.findMany({
      where: {
        clientId: clientId,
      },
      include: {
        subscription: {
          include: {
            plan: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return transactions;
  }

  /**
   * Create a Stripe checkout session for a plan purchase
   * @param planId The ID of the plan to purchase
   * @param clientId The ID of the client making the purchase
   * @returns The checkout session URL
   */
  async createCheckoutSession(planId: string, clientId: number): Promise<string> {
    // Fetch plan details
    const plan = await this.prisma.plan.findUnique({
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

    if (!plan) {
      throw new ApiError(404, 'Plan not found');
    }

    if (!plan.prices.length) {
      throw new ApiError(400, 'No active prices found for this plan');
    }

    // Fetch client details
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: { user: true },
    });

    if (!client) {
      throw new ApiError(404, 'Client not found');
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
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
        userId: client.userId.toString(),
        planId: plan.id,
        priceId: plan.prices[0].id,
      },
    });

    // Record the payment transaction
    await this.recordPaymentTransaction({
      clientId,
      amount: Number(plan.prices[0].amount),
      currency: 'USD',
      type: 'SUBSCRIPTION',
      status: 'PENDING',
      stripeSessionId: session.id,
      metadata: {
        planId: plan.id,
        priceId: plan.prices[0].id,
      },
    });

    return session.url || '';
  }

  /**
   * Create a payment link for a custom plan request
   * @param customPlanRequest The custom plan request details
   * @returns The payment link URL
   */
  async createCustomPlanPaymentLink(customPlanRequest: CustomPlanRequest): Promise<string> {
    // Fetch client details
    const client = await this.prisma.client.findUnique({
      where: { id: customPlanRequest.clientId },
      include: { user: true },
    });

    if (!client) {
      throw new ApiError(404, 'Client not found');
    }

    // Calculate price based on requested credits and duration
    const basePrice = customPlanRequest.requestedCredits * 0.1; // $0.10 per credit
    const brandMultiplier = customPlanRequest.requestedBrands * 5; // $5 per brand
    const durationDiscount = customPlanRequest.durationMonths > 1 ? 0.9 : 1; // 10% discount for multi-month

    const totalPrice = (basePrice + brandMultiplier) * durationDiscount;

    // First create a product
    const product = await stripe.products.create({
      name: 'Custom Subscription Plan',
      description: `${customPlanRequest.requestedCredits} credits, ${customPlanRequest.requestedBrands} brands, ${customPlanRequest.durationMonths} months`,
    });

    // Then create a price for that product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(totalPrice * 100),
      currency: 'usd',
    });

    // Create a Stripe payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.FRONTEND_URL}/subscription/custom-success?request_id=${customPlanRequest.id}`,
        },
      },
      metadata: {
        customPlanRequestId: customPlanRequest.id,
        clientId: client.id.toString(),
        requestedCredits: customPlanRequest.requestedCredits.toString(),
        requestedBrands: customPlanRequest.requestedBrands.toString(),
        durationMonths: customPlanRequest.durationMonths.toString(),
      },
    });

    // Update the custom plan request with the payment link
    await this.prisma.customPlanRequest.update({
      where: { id: customPlanRequest.id },
      data: {
        stripePaymentLink: paymentLink.url,
        status: 'PAYMENT_PENDING',
      },
    });

    // Send email to client with payment link
    await this.sendCustomPlanPaymentEmail(client, customPlanRequest, paymentLink.url);

    return paymentLink.url;
  }

  /**
   * Handle Stripe webhook events
   * @param event The Stripe webhook event
   */
  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    console.log(`Processing webhook event: ${event.type} (${event.id})`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          console.log(`Invoice payment succeeded: ${event.id}`);
          // Handle invoice payment success if needed
          break;

        case 'charge.succeeded':
          console.log(`Charge succeeded: ${event.id}`);
          // Handle charge success if needed
          break;

        case 'payment_intent.created':
          console.log(`Payment intent created: ${event.id}`);
          // Handle payment intent creation if needed
          break;

        case 'charge.updated':
          console.log(`Charge updated: ${event.id}`);
          // Handle charge updates if needed
          break;

        case 'product.created':
        case 'price.created':
          console.log(`Product/Price created: ${event.id}`);
          // Handle product/price creation if needed
          break;

        default:
          // Handle any other event types that might be sent
          if (event.type.includes('invoice') || event.type.includes('payment')) {
            console.log(`Payment-related event: ${event.type} (${event.id})`);
          } else {
            console.log(`Unhandled webhook event type: ${event.type} (${event.id})`);
          }
          // Don't throw error for unhandled events, just log them
          break;
      }

      console.log(`Successfully processed webhook event: ${event.type} (${event.id})`);
    } catch (error) {
      console.error(`Error processing webhook event ${event.type} (${event.id}):`, error);
      throw error; // Re-throw to be handled by the controller
    }
  }

  /**
   * Process a successful checkout session
   * @param session The completed checkout session
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const { clientId, userId, planId, priceId } = session.metadata || {};

    console.log('Checkout session metadata:', { clientId, userId, planId, priceId });

    if (!userId || !planId || !priceId) {
      throw new ApiError(400, 'Missing required metadata in checkout session');
    }

    const userIdToUse = Number(userId);
    console.log('Processing checkout session for userId:', userIdToUse);

    // Check if subscription already exists
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        client: {
          userId: userIdToUse,
        },
        planId,
        status: 'ACTIVE',
      },
    });

    if (!existingSubscription) {
      // Use subscription service to create subscription
      const subscription = await this.subscriptionService.createSubscription({
        userId: userIdToUse,
        planId,
        priceId,
        status: 'ACTIVE',
        currentPeriodStart: DateUtils.getCurrentDate(),
        currentPeriodEnd: this.calculatePeriodEnd(planId),
        billingCycle: 'MONTHLY', // Default to monthly, can be enhanced to detect from metadata
      });

      // Allocate credits to the client
      await this.allocateCreditsToClient(subscription);

      // Fetch subscription with client and user relationships for email
      const subscriptionWithRelations = await this.prisma.subscription.findUnique({
        where: { id: subscription.id },
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

      // Send confirmation email
      await this.sendSubscriptionConfirmationEmail(subscriptionWithRelations, session);

      console.log('Checkout session completed successfully for subscription:', subscription.id);
    }
  }

  /**
   * Process a successful payment intent
   * @param paymentIntent The successful payment intent
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { customPlanRequestId } = paymentIntent.metadata || {};

    console.log('Payment intent metadata:', { customPlanRequestId });

    if (customPlanRequestId) {
      // This is a custom plan payment
      const customPlanRequest = await this.prisma.customPlanRequest.findUnique({
        where: { id: customPlanRequestId },
        include: {
          clients: {
            include: {
              user: true,
            },
          },
        },
      });

      console.log(
        'Found custom plan request:',
        customPlanRequest
          ? {
              id: customPlanRequest.id,
              clientId: customPlanRequest.clientId,
              clientUserId: customPlanRequest.clients?.userId,
            }
          : 'Not found',
      );

      if (!customPlanRequest) {
        throw new ApiError(404, 'Custom plan request not found');
      }

      // Update custom plan request status
      await this.prisma.customPlanRequest.update({
        where: { id: customPlanRequestId },
        data: { status: 'PAID' },
      });

      // Create a custom plan
      const customPlan = await this.createCustomPlan(customPlanRequest);

      // Use subscription service to create subscription for the custom plan
      const subscription = await this.subscriptionService.createSubscription({
        userId: customPlanRequest.clients.userId,
        planId: customPlan.id,
        priceId: customPlan.prices[0].id,
        customCredits: customPlanRequest.requestedCredits,
        status: 'ACTIVE',
        currentPeriodStart: DateUtils.getCurrentDate(),
        currentPeriodEnd: DateUtils.calculateCustomPlanEnd(customPlanRequest.durationMonths),
        billingCycle: 'MONTHLY', // Custom plans are typically monthly
      });

      // Allocate credits to the client
      await this.allocateCustomCreditsToClient(subscription);

      // Fetch subscription with client and user relationships for email
      const subscriptionWithRelations = await this.prisma.subscription.findUnique({
        where: { id: subscription.id },
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

      // Send confirmation email
      await this.sendCustomPlanConfirmationEmail(subscriptionWithRelations);

      console.log('Custom plan payment completed successfully for subscription:', subscription.id);
    }
  }

  /**
   * Process a failed payment intent
   * @param paymentIntent The failed payment intent
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { customPlanRequestId } = paymentIntent.metadata || {};

    if (customPlanRequestId) {
      // Update custom plan request status
      await this.prisma.customPlanRequest.update({
        where: { id: customPlanRequestId },
        data: { status: 'PAYMENT_FAILED' },
      });

      // Send payment failure email
      const customPlanRequest = await this.prisma.customPlanRequest.findUnique({
        where: { id: customPlanRequestId },
        include: {
          clients: {
            include: {
              user: true,
            },
          },
        },
      });

      if (customPlanRequest && customPlanRequest.clients.user) {
        await this.sendPaymentFailureEmail(customPlanRequest.clients.user.email);
      }
    }
  }

  /**
   * Handle subscription created event from Stripe
   * @param subscription The Stripe subscription object
   */
  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    console.log(`Subscription created in Stripe: ${subscription.id}`);

    // This event is typically handled by checkout.session.completed
    // But we can add additional logic here if needed
    const { clientId, planId, priceId } = subscription.metadata || {};

    if (clientId && planId && priceId) {
      // Update local subscription status if needed
      await this.prisma.subscription.updateMany({
        where: {
          clientId: Number(clientId),
          planId,
        },
        data: {
          status: subscription.status === 'active' ? 'ACTIVE' : 'PENDING',
        },
      });
    }
  }

  /**
   * Handle subscription updated event from Stripe
   * @param stripeSubscription The Stripe subscription object
   */
  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<void> {
    console.log(`Subscription updated in Stripe: ${stripeSubscription.id}`);

    const { clientId, planId } = stripeSubscription.metadata || {};

    if (clientId && planId) {
      // Update local subscription status
      await this.prisma.subscription.updateMany({
        where: {
          clientId: Number(clientId),
          planId,
        },
        data: {
          status: stripeSubscription.status === 'active' ? 'ACTIVE' : 'PENDING',
          currentPeriodStart: DateUtils.fromUnixTimestamp(
            (stripeSubscription as any).current_period_start,
          ),
          currentPeriodEnd: DateUtils.fromUnixTimestamp(
            (stripeSubscription as any).current_period_end,
          ),
        },
      });
    }
  }

  /**
   * Handle subscription deleted event from Stripe
   * @param subscription The Stripe subscription object
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    console.log(`Subscription deleted in Stripe: ${subscription.id}`);

    const { clientId, planId } = subscription.metadata || {};

    if (clientId && planId) {
      // Update local subscription status to cancelled
      await this.prisma.subscription.updateMany({
        where: {
          clientId: Number(clientId),
          planId,
        },
        data: {
          status: 'CANCELED',
        },
      });
    }
  }

  /**
   * Record a payment transaction
   * @param data The payment transaction data
   */
  private async recordPaymentTransaction(data: {
    clientId: number;
    amount: number;
    currency: string;
    type: TransactionType;
    status: PaymentStatusType;
    stripeSessionId: string;
    subscriptionId?: string;
    metadata?: any;
  }): Promise<PaymentTransaction> {
    return this.prisma.paymentTransaction.create({
      data: {
        client: { connect: { id: data.clientId } },
        subscription: data.subscriptionId ? { connect: { id: data.subscriptionId } } : undefined,
        amount: data.amount,
        currency: data.currency,
        type: data.type as any, // Cast to match TransactionType enum
        status: data.status as any, // Cast to match PaymentStatusType enum
        paymentMethod: 'CREDIT_CARD',
        paymentReference: data.stripeSessionId,
        description: `Payment for subscription: ${data.type}`,
        metadata: data.metadata || {},
      },
    });
  }

  /**
   * Update a payment transaction status
   * @param stripeSessionId The Stripe session ID
   * @param status The new status
   */
  private async updatePaymentTransactionStatus(
    stripeSessionId: string,
    status: PaymentStatusType,
  ): Promise<void> {
    await this.prisma.paymentTransaction.updateMany({
      where: {
        paymentReference: {
          equals: stripeSessionId,
        },
      },
      data: {
        status: status as any, // Cast to match PaymentStatusType enum
      },
    });
  }

  /**
   * Calculate the end date for a subscription period
   * @param planId The plan ID
   * @returns The calculated end date
   */
  private calculatePeriodEnd(planId: string): Date {
    // Default to monthly billing cycle
    return DateUtils.calculatePeriodEnd('MONTHLY');
  }

  /**
   * Allocate credits to a client based on their subscription
   * @param subscription The subscription
   */
  private async allocateCreditsToClient(subscription: any): Promise<void> {
    const creditAmount = subscription.price?.credits || 0;

    if (creditAmount > 0) {
      await this.prisma.creditTransaction.create({
        data: {
          client: { connect: { id: subscription.clientId } },
          subscription: { connect: { id: subscription.id } },
          amount: creditAmount,
          type: 'SUBSCRIPTION',
          description: `Credits allocated from ${subscription.plan.name} plan purchase`,
          remaining: creditAmount,
        },
      });
    }
  }

  /**
   * Allocate custom credits to a client
   * @param subscription The subscription with custom credits
   */
  private async allocateCustomCreditsToClient(subscription: any): Promise<void> {
    if (subscription.customCredits && subscription.customCredits > 0) {
      await this.prisma.creditTransaction.create({
        data: {
          client: { connect: { id: subscription.clientId } },
          subscription: { connect: { id: subscription.id } },
          amount: subscription.customCredits,
          type: 'SUBSCRIPTION',
          description: `Credits allocated from custom plan purchase`,
          remaining: subscription.customCredits,
        },
      });
    }
  }

  /**
   * Create a custom plan based on a custom plan request
   * @param customPlanRequest The custom plan request
   * @returns The created custom plan
   */
  private async createCustomPlan(customPlanRequest: CustomPlanRequest): Promise<any> {
    // Create a new plan
    const plan = await this.prisma.plan.create({
      data: {
        name: `Custom Plan - ${customPlanRequest.clientId}`,
        description: `Custom plan with ${customPlanRequest.requestedCredits} credits and ${customPlanRequest.requestedBrands} brands`,
        isCustom: true,
        PlanStatistics: {
          connect: { id: 1 }, // Connect to default plan statistics
        },
        prices: {
          create: {
            credits: customPlanRequest.requestedCredits,
            amount: this.calculateCustomPlanPrice(customPlanRequest),
            billingCycle: 'MONTHLY',
            isActive: true,
          },
        },
        features: {
          create: [
            {
              feature: {
                connect: { key: 'brands' },
              },
              value: customPlanRequest.requestedBrands.toString(),
              expirationPolicy: 'END_OF_BILLING_CYCLE',
            },
            {
              feature: {
                connect: { key: 'custom_plan' },
              },
              value: 'true',
              expirationPolicy: 'END_OF_BILLING_CYCLE',
            },
          ],
        },
      },
      include: {
        prices: true,
        features: {
          include: {
            feature: true,
          },
        },
      },
    });

    return plan;
  }

  /**
   * Calculate the price of a custom plan
   * @param customPlanRequest The custom plan request
   * @returns The calculated price
   */
  private calculateCustomPlanPrice(customPlanRequest: CustomPlanRequest): number {
    const basePrice = customPlanRequest.requestedCredits * 0.1; // $0.10 per credit
    const brandMultiplier = customPlanRequest.requestedBrands * 5; // $5 per brand
    const durationDiscount = customPlanRequest.durationMonths > 1 ? 0.9 : 1; // 10% discount for multi-month

    return (basePrice + brandMultiplier) * durationDiscount;
  }

  /**
   * Send a subscription confirmation email
   * @param subscription The subscription
   * @param session The Stripe checkout session
   */
  private async sendSubscriptionConfirmationEmail(
    subscription: any,
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    try {
      const client = subscription.client;

      if (!client || !client.user) {
        console.error('Client or user not found in subscription:', subscription.id);
        return;
      }

      const subject = 'Subscription Confirmation';
      const text = `Thank you for subscribing to ${subscription.plan.name}`;
      const htmlContent = generateEmailHTML('subscription_confirmation', {
        name: `${client.user.firstName} ${client.user.lastName}`,
        subscriptionPlan: subscription.plan.name,
        credits: subscription.price?.credits || 0,
        brandSlots:
          subscription.plan.features.find((f: any) => f.feature.key === 'brands')?.value || '0',
        validUntil: DateUtils.formatForDisplay(subscription.currentPeriodEnd),
        transactionId: session.id,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency?.toUpperCase() || 'USD',
        dashboardLink: `${process.env.FRONTEND_URL}/dashboard/subscriptions`,
      });

      await emailService.sendEmail(client.user.email, subject, text, htmlContent);
      console.log('Subscription confirmation email sent to:', client.user.email);
    } catch (error) {
      console.error('Error sending subscription confirmation email:', error);
      // Don't throw error to avoid breaking the webhook processing
    }
  }

  /**
   * Send a custom plan confirmation email
   * @param subscription The subscription
   */
  private async sendCustomPlanConfirmationEmail(subscription: any): Promise<void> {
    try {
      const client = subscription.client;

      if (!client || !client.user) {
        console.error('Client or user not found in subscription:', subscription.id);
        return;
      }

      const subject = 'Custom Plan Confirmation';
      const text = `Thank you for subscribing to your custom plan`;
      const htmlContent = generateEmailHTML('custom_plan_confirmation', {
        name: `${client.user.firstName} ${client.user.lastName}`,
        credits: subscription.customCredits || 0,
        brandSlots:
          subscription.plan.features.find((f: any) => f.feature.key === 'brands')?.value || '0',
        validUntil: DateUtils.formatForDisplay(subscription.currentPeriodEnd),
        dashboardLink: `${process.env.FRONTEND_URL}/dashboard/subscriptions`,
      });

      await emailService.sendEmail(client.user.email, subject, text, htmlContent);
      console.log('Custom plan confirmation email sent to:', client.user.email);
    } catch (error) {
      console.error('Error sending custom plan confirmation email:', error);
      // Don't throw error to avoid breaking the webhook processing
    }
  }

  /**
   * Send a custom plan payment email
   * @param client The client
   * @param customPlanRequest The custom plan request
   * @param paymentLink The payment link URL
   */
  private async sendCustomPlanPaymentEmail(
    client: any,
    customPlanRequest: CustomPlanRequest,
    paymentLink: string,
  ): Promise<void> {
    const subject = 'Custom Plan Payment Link';
    const text = `Complete your payment for your custom plan`;
    const htmlContent = generateEmailHTML('custom_plan_payment', {
      name: `${client.user.firstName} ${client.user.lastName}`,
      credits: customPlanRequest.requestedCredits,
      brands: customPlanRequest.requestedBrands,
      duration: customPlanRequest.durationMonths,
      paymentLink,
      expiryDate: DateUtils.formatForDisplay(DateUtils.calculateCustomPlanEnd(7)), // 7 days from now
    });

    await emailService.sendEmail(client.user.email, subject, text, htmlContent);
  }

  /**
   * Send a payment failure email
   * @param email The recipient email
   */
  private async sendPaymentFailureEmail(email: string): Promise<void> {
    const subject = 'Payment Failed';
    const text = 'Your payment for the custom plan has failed';
    const htmlContent = generateEmailHTML('payment_failure', {
      supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
      dashboardLink: `${process.env.FRONTEND_URL}/dashboard/billing`,
    });

    await emailService.sendEmail(email, subject, text, htmlContent);
  }

  /**
   * Get an invoice by its ID
   * @param invoiceId The ID of the invoice to retrieve
   * @returns The invoice details
   */
  async getInvoiceById(invoiceId: number): Promise<any> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        subscription: {
          include: {
            client: {
              include: {
                user: true,
              },
            },
            plan: true,
            price: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new ApiError(404, 'Invoice not found');
    }

    return invoice;
  }

  /**
   * Create a customer portal session for managing subscription
   * @param clientId The ID of the client
   * @returns The portal session URL
   */
  async createCustomerPortalSession(clientId: number): Promise<string> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: { user: true },
    });

    if (!client) {
      throw new ApiError(404, 'Client not found');
    }

    let stripeCustomerId: string | null = client.stripeCustomerId;
    if (!stripeCustomerId) {
      const customerName =
        client.companyName || `${client.user.firstName} ${client.user.lastName}`.trim();
      const customer = await stripe.customers.create({
        email: client.user.email,
        name: customerName,
        metadata: {
          clientId: client.id.toString(),
        },
      });

      // Update client with Stripe customer ID
      await this.prisma.client.update({
        where: { id: clientId },
        data: { stripeCustomerId: customer.id },
      });

      stripeCustomerId = customer.id;
    }

    if (!stripeCustomerId) {
      throw new ApiError(500, 'Stripe customer ID could not be determined');
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${process.env.FRONTEND_URL}/dashboard/subscriptions`,
        // Optional: Configure what features are available
        configuration: undefined, // Use default configuration
        // Optional: Set locale for internationalization
        locale: 'auto',
      });

      return session.url;
    } catch (error: any) {
      // Handle the specific error for missing portal configuration
      if (error.code === 'resource_missing' && error.message.includes('configuration')) {
        throw new ApiError(
          400,
          'Customer portal is not configured. Please contact support to set up billing management.',
        );
      }

      // Handle other Stripe errors
      console.error('Stripe portal session error:', error);
      throw new ApiError(500, 'Unable to create billing portal session. Please try again later.');
    }
  }

  /**
   * Create a refund for a payment
   * @param paymentId The ID of the payment to refund
   * @param amount The amount to refund (optional)
   * @param reason The reason for the refund (optional)
   * @returns The refund details
   */
  async createRefund(paymentId: string, amount?: number, reason?: string): Promise<any> {
    const refund = await stripe.refunds.create({
      payment_intent: paymentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason as any,
    });

    // Update payment transaction status
    await this.updatePaymentTransactionStatus(paymentId, 'REFUNDED');

    return refund;
  }

  /**
   * Update the default payment method for a client
   * @param clientId The ID of the client
   * @param paymentMethodId The ID of the new payment method
   * @returns The updated client details
   */
  async updateDefaultPaymentMethod(clientId: number, paymentMethodId: string): Promise<any> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new ApiError(404, 'Client not found');
    }

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: client.stripeCustomerId as string,
    });

    // Set as default payment method
    await stripe.customers.update(client.stripeCustomerId as string, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return client;
  }

  /**
   * Construct a Stripe webhook event from the request body and signature
   * @param payload The raw request body
   * @param signature The Stripe signature from the request headers
   * @returns The constructed Stripe event
   */
  async constructWebhookEvent(payload: any, signature: string): Promise<Stripe.Event> {
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string,
      );
    } catch (err) {
      throw new ApiError(
        400,
        `Webhook signature verification failed: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Handle a Stripe webhook event
   * @param event The Stripe webhook event
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      await this.handleStripeWebhook(event);
    } catch (err) {
      console.error('Error handling webhook event:', err);
      throw new ApiError(
        500,
        `Error processing webhook: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    }
  }
}

// Fix the export at the end of the file
export default PaymentService;
