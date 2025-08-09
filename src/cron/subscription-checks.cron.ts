import cron from 'node-cron';
import logger from '../config/logger';
import subscriptionEventHandler from '../services/subscription/subscription-event-handler.service';

/**
 * Schedule for checking subscriptions with low credits
 * Runs daily at 9:00 AM
 */
export const scheduleLowCreditsCheck = (): void => {
  try {
    // Validate cron expression before scheduling
    if (!cron.validate('0 9 * * *')) {
      throw new Error('Invalid cron expression for low credits check');
    }

    cron.schedule('0 9 * * *', async () => {
      logger.info('Running scheduled low credits check');
      await subscriptionEventHandler.checkLowCredits();
    });

    logger.info('Scheduled low credits check is set up');
  } catch (error) {
    logger.error('Failed to schedule low credits check with cron, using fallback:', error);
    // Fallback: run every 24 hours using setInterval
    setInterval(async () => {
      logger.info('Running fallback low credits check');
      await subscriptionEventHandler.checkLowCredits();
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
    logger.info('Fallback low credits check scheduled (every 24 hours)');
  }
};

/**
 * Schedule for checking expired subscription packages
 * Runs daily at 0:15 AM
 */
export const scheduleExpiryCheck = (): void => {
  try {
    // Validate cron expression before scheduling
    if (!cron.validate('15 0 * * *')) {
      throw new Error('Invalid cron expression for expiry check');
    }

    cron.schedule('15 0 * * *', async () => {
      logger.info('Running scheduled subscription expiry check');
      await subscriptionEventHandler.checkExpiredPackages();
    });

    logger.info('Scheduled subscription expiry check is set up');
  } catch (error) {
    logger.error('Failed to schedule expiry check with cron, using fallback:', error);
    // Fallback: run every 24 hours using setInterval
    setInterval(async () => {
      logger.info('Running fallback subscription expiry check');
      await subscriptionEventHandler.checkExpiredPackages();
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
    logger.info('Fallback expiry check scheduled (every 24 hours)');
  }
};

/**
 * Initialize all subscription-related cron jobs
 */
export const initSubscriptionCronJobs = (): void => {
  try {
    logger.info('Initializing subscription cron jobs');
    scheduleLowCreditsCheck();
    scheduleExpiryCheck();
    logger.info('All subscription cron jobs initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize subscription cron jobs:', error);
    // Don't throw the error to prevent app startup failure
    // Just log it and continue
  }
};
