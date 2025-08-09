import cron from 'node-cron';
import logger from '../config/logger';
import { updateBusinessMetrics } from '../services/metrics.service';

// Update business metrics every 5 minutes
export const startMetricsCron = () => {
  try {
    // Validate cron expression before scheduling
    if (!cron.validate('*/5 * * * *')) {
      throw new Error('Invalid cron expression for metrics update');
    }

    cron.schedule('*/5 * * * *', async () => {
      try {
        await updateBusinessMetrics();
        logger.info('Business metrics updated successfully');
      } catch (error) {
        logger.error('Error updating business metrics:', error);
      }
    });

    logger.info('Metrics cron job started - updating every 5 minutes');
  } catch (error) {
    logger.error('Failed to start metrics cron job with cron, using fallback:', error);
    // Fallback: run every 5 minutes using setInterval
    setInterval(async () => {
      try {
        await updateBusinessMetrics();
        logger.info('Business metrics updated successfully (fallback)');
      } catch (error) {
        logger.error('Error updating business metrics (fallback):', error);
      }
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
    logger.info('Fallback metrics cron job started - updating every 5 minutes');
  }
};
