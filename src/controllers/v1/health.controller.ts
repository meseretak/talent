import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export class HealthController {
  static async check(req: Request, res: Response) {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'up',
          api: 'up',
        },
        version: process.env.npm_package_version || '1.0.0',
      };

      res.status(200).json(healthStatus);
    } catch (error) {
      const unhealthyStatus = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: error instanceof Error ? 'down' : 'up',
          api: 'up',
        },
        version: process.env.npm_package_version || '1.0.0',
      };

      res.status(503).json(unhealthyStatus);
    }
  }
}
