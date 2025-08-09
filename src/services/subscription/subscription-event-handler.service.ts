import logger from '../../config/logger';
import { subscriptionEvents } from '../../events/subscription.events';
import { PrismaClient, SubscriptionStatus } from '../../generated/prisma';

class SubscriptionEventHandlerService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Check all active subscriptions for low credits and trigger notifications
   */
  public async checkLowCredits(): Promise<void> {
    try {
      logger.info('Checking for subscriptions with low credits...');

      // Get all active subscriptions
      const activeSubscriptions = await this.prisma.subscription.findMany({
        where: { status: SubscriptionStatus.ACTIVE },
        include: {
          price: true,
        },
      });

      logger.info(`Found ${activeSubscriptions.length} active subscriptions`);

      // Check each subscription for low credits
      for (const subscription of activeSubscriptions) {
        const totalCredits = subscription.price?.credits || subscription.customCredits || 0;
        const usedCredits = subscription.baseCreditsUsed;
        const remainingCredits = totalCredits - usedCredits;

        // If less than 20% credits remain
        if (totalCredits > 0 && remainingCredits <= totalCredits * 0.2) {
          logger.info(
            `Subscription ${subscription.id} is low on credits: ${remainingCredits}/${totalCredits}`,
          );
          await subscriptionEvents.onCreditsLow(subscription.id);
        }
      }

      logger.info('Low credits check completed');
    } catch (error) {
      logger.error('Error checking for low credits:', error);
    }
  }

  /**
   * Check for expired subscriptions and trigger expiry events
   */
  public async checkExpiredPackages(): Promise<void> {
    try {
      logger.info('Checking for expired subscription packages...');

      const currentDate = new Date();

      // Find subscriptions that have expired but are still active
      const expiredSubscriptions = await this.prisma.subscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd: {
            lt: currentDate,
          },
        },
      });

      logger.info(`Found ${expiredSubscriptions.length} expired subscriptions`);

      // Process each expired subscription
      for (const subscription of expiredSubscriptions) {
        logger.info(`Processing expiry for subscription ${subscription.id}`);
        await subscriptionEvents.onPackageExpiry(subscription.id);
      }

      logger.info('Expired packages check completed');
    } catch (error) {
      logger.error('Error checking for expired packages:', error);
    }
  }
}

export default new SubscriptionEventHandlerService();
