import PolicyEngine from './abac/engine';
import { server } from './app';
import prisma from './client';
import config from './config/config';
import logger from './config/logger';
import { startMetricsCron } from './cron/metrics.cron';
import { initSubscriptionCronJobs } from './cron/subscription-checks.cron';

logger.info(`Running in ${config.env} environment`);

async function startServer() {
  try {
    // Initialize PolicyEngine and connect to database
    await PolicyEngine.initializeFromFiles();
    await prisma.$connect();
    const port = 4000;
    logger.info('Connected to SQL Database');
    logger.info('Application starting up...');
    logger.info(`Environment: ${config.env}`);
    logger.info(`Loki host: ${config.loki?.host || 'http://172.17.0.1:3100'}`);

    // Initialize cron jobs for subscription monitoring (non-blocking)
    if (config.env !== 'test') {
      try {
        initSubscriptionCronJobs();
        startMetricsCron();
        logger.info('Cron jobs initialized');
      } catch (cronError) {
        logger.error(
          'Failed to initialize cron jobs, but continuing with server startup:',
          cronError,
        );
        // Don't let cron job failures prevent server startup
      }
    }

    server.listen(port, () => {
      logger.info(`🚀 Server listening on port ${port}`);
      logger.info('📊 Metrics available at /metrics');
      logger.info('🏥 Health check available at /api/health');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
