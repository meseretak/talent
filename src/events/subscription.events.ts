import { PrismaClient, SubscriptionStatus } from '../generated/prisma';
import emailService from '../services/communication/email.service';
import generateEmailHTML from '../template/email';

const prisma = new PrismaClient();

// Credit threshold that triggers the low credits notification (20% of total)
const LOW_CREDITS_THRESHOLD_PERCENTAGE = 0.2;

// Subscription Events
export const subscriptionEvents = {
  /**
   * Notify client when their credits are running low
   * @param subscriptionId The subscription ID
   */
  onCreditsLow: async (subscriptionId: string) => {
    try {
      // Get subscription with related data
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: {
          client: {
            include: {
              user: true,
            },
          },
          plan: true,
          price: true,
        },
      });

      if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
        console.error(
          `Cannot process low credits alert: Subscription ${subscriptionId} not found or not active`,
        );
        return;
      }

      // Calculate total available credits and used credits
      const totalCredits = subscription.price?.credits || subscription.customCredits || 0;
      const usedCredits = subscription.baseCreditsUsed;
      const remainingCredits = totalCredits - usedCredits;

      // Check if credits are below the threshold
      if (remainingCredits <= totalCredits * LOW_CREDITS_THRESHOLD_PERCENTAGE) {
        // Send low credits notification email
        const client = subscription.client;

        if (client?.user?.email) {
          const subject = 'Low Credits Alert';
          const text = `Your account is running low on credits. You have ${remainingCredits} credits remaining.`;

          const htmlContent = generateEmailHTML('low_credits', {
            name: `${client.user.firstName || ''} ${client.user.lastName || ''}`,
            remainingCredits,
            usedCredits,
            ctaLink: `${process.env.FRONTEND_URL || ''}/dashboard/credits`,
          });

          await emailService.sendEmail(client.user.email, subject, text, htmlContent);
          console.log(`Low credits notification sent to ${client.user.email}`);
        }
      }
    } catch (error) {
      console.error('Error in onCreditsLow event:', error);
    }
  },

  /**
   * Handle subscription package expiration
   * @param subscriptionId The subscription ID
   */
  onPackageExpiry: async (subscriptionId: string) => {
    try {
      // Get subscription with related data
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: {
          client: {
            include: {
              user: true,
            },
          },
          plan: true,
        },
      });

      if (!subscription) {
        console.error(`Cannot process package expiry: Subscription ${subscriptionId} not found`);
        return;
      }

      // Update subscription status to EXPIRED
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: SubscriptionStatus.EXPIRED },
      });

      // Create subscription history record
      await prisma.subscriptionHistory.create({
        data: {
          subscriptionId,
          planId: subscription.planId,
          priceId: subscription.priceId || undefined,
          status: SubscriptionStatus.EXPIRED,
          startDate: subscription.currentPeriodStart,
          endDate: subscription.currentPeriodEnd,
          reason: 'Package expired',
        },
      });

      // Send expiration notification email
      const client = subscription.client;

      if (client?.user?.email) {
        const subject = 'Subscription Expired';
        const text = `Your subscription to the ${subscription.plan.name} plan has expired. Please renew your subscription to continue using our services.`;

        const htmlContent = generateEmailHTML('custom', {
          name: `${client.user.firstName || ''} ${client.user.lastName || ''}`,
          subject: 'Subscription Expired',
          message: `Your subscription to the <strong>${subscription.plan.name}</strong> plan has expired. To continue enjoying our services without interruption, please renew your subscription.`,
          ctaText: 'Renew Subscription',
          ctaLink: `${process.env.FRONTEND_URL || ''}/dashboard/subscription`,
        });

        await emailService.sendEmail(client.user.email, subject, text, htmlContent);
        console.log(`Subscription expiry notification sent to ${client.user.email}`);
      }
    } catch (error) {
      console.error('Error in onPackageExpiry event:', error);
    }
  },
};
