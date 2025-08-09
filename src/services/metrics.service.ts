import { Counter, Gauge, Histogram, register } from 'prom-client';
import { PrismaClient, ProjectStatusType, UserStatus } from '../generated/prisma';

const prisma = new PrismaClient();

// Custom metrics
export const customMetrics = {
  // Database connection metrics
  dbConnections: new Gauge({
    name: 'database_connections_total',
    help: 'Total number of database connections',
    labelNames: ['status'],
  }),

  // Business metrics
  activeUsers: new Gauge({
    name: 'active_users_total',
    help: 'Total number of active users',
  }),

  activeProjects: new Gauge({
    name: 'active_projects_total',
    help: 'Total number of active projects',
  }),

  completedProjects: new Gauge({
    name: 'completed_projects_total',
    help: 'Total number of completed projects',
  }),

  // API specific metrics
  apiRequests: new Counter({
    name: 'api_requests_total',
    help: 'Total number of API requests',
    labelNames: ['method', 'endpoint', 'status'],
  }),

  apiResponseTime: new Histogram({
    name: 'api_response_time_seconds',
    help: 'API response time in seconds',
    labelNames: ['method', 'endpoint'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
  }),

  // Error metrics
  errors: new Counter({
    name: 'application_errors_total',
    help: 'Total number of application errors',
    labelNames: ['type', 'endpoint'],
  }),

  // Authentication metrics
  authAttempts: new Counter({
    name: 'authentication_attempts_total',
    help: 'Total number of authentication attempts',
    labelNames: ['method', 'success'],
  }),

  // Payment metrics
  paymentTransactions: new Counter({
    name: 'payment_transactions_total',
    help: 'Total number of payment transactions',
    labelNames: ['status', 'method'],
  }),

  // File upload metrics
  fileUploads: new Counter({
    name: 'file_uploads_total',
    help: 'Total number of file uploads',
    labelNames: ['type', 'status'],
  }),
};

// Function to update business metrics
export async function updateBusinessMetrics() {
  try {
    // Update user metrics
    const activeUsersCount = await prisma.user.count({
      where: {
        status: UserStatus.ACTIVE,
      },
    });
    customMetrics.activeUsers.set(activeUsersCount);

    // Update project metrics
    const activeProjectsCount = await prisma.project.count({
      where: {
        status: ProjectStatusType.IN_PROGRESS,
      },
    });
    customMetrics.activeProjects.set(activeProjectsCount);

    const completedProjectsCount = await prisma.project.count({
      where: {
        status: ProjectStatusType.COMPLETED,
      },
    });
    customMetrics.completedProjects.set(completedProjectsCount);

    // Update database connection status
    try {
      await prisma.$queryRaw`SELECT 1`;
      customMetrics.dbConnections.set({ status: 'connected' }, 1);
      customMetrics.dbConnections.set({ status: 'disconnected' }, 0);
    } catch (error) {
      customMetrics.dbConnections.set({ status: 'connected' }, 0);
      customMetrics.dbConnections.set({ status: 'disconnected' }, 1);
    }
  } catch (error) {
    console.error('Error updating business metrics:', error);
  }
}

// Function to record API request
export function recordApiRequest(
  method: string,
  endpoint: string,
  status: number,
  duration: number,
) {
  customMetrics.apiRequests.inc({ method, endpoint, status: status.toString() });
  customMetrics.apiResponseTime.observe({ method, endpoint }, duration / 1000); // Convert to seconds
}

// Function to record error
export function recordError(type: string, endpoint: string) {
  customMetrics.errors.inc({ type, endpoint });
}

// Function to record authentication attempt
export function recordAuthAttempt(method: string, success: boolean) {
  customMetrics.authAttempts.inc({ method, success: success.toString() });
}

// Function to record payment transaction
export function recordPaymentTransaction(status: string, method: string) {
  customMetrics.paymentTransactions.inc({ status, method });
}

// Function to record file upload
export function recordFileUpload(type: string, status: string) {
  customMetrics.fileUploads.inc({ type, status });
}

// Export the register for use in metrics endpoint
export { register };
