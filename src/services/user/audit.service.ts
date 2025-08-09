import axios from 'axios';
import prisma from '../../client';
import logger from '../../config/logger';
import { AuditActionType } from '../../generated/prisma';

interface GeoData {
  org?: string;
  asn?: string;
  city?: string;
  region?: string;
  country_name?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  currency?: string;
  languages?: string;
}

interface LoginAuditData {
  userId: number;
  email: string;
  ip: string;
  userAgent?: string;
  platform?: string;
  host?: string;
}

interface AuditLogInput {
  userId: number;
  action: AuditActionType;
  entityType: string;
  entityId: number;
  details?: string;
  metadata?: Record<string, any>;
}

interface AuditLogFilters {
  userId?: number;
  action?: AuditActionType[];
  entityType?: string;
  entityId?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

interface AuditLogSummary {
  user: any;
  totalActions: number;
  actionSummary: Record<AuditActionType, number>;
  entitySummary: Record<string, number>;
  logs: any[];
  period: {
    start: Date;
    end: Date;
  };
}

interface SystemActivitySummary {
  totalActions: number;
  dailyActivity: Record<string, number>;
  userActivity: Record<number, number>;
  actionSummary: Record<AuditActionType, number>;
  period: {
    start: Date;
    end: Date;
  };
}

const logAction = async (data: AuditLogInput): Promise<any> => {
  try {
    if (!data.userId) {
      throw new Error('User ID is required for audit logging');
    }

    // Verify user exists first
    const user = await prisma.user.findUnique({
      where: {
        id: data.userId,
      },
    });

    if (!user) {
      throw new Error(`User with ID ${data.userId} not found`);
    }

    return prisma.auditLog.create({
      data: {
        user: { connect: { id: data.userId } },
        action: data.action,
        projectId: data.entityType === 'project' ? data.entityId : undefined,
        details: data.details,
      },
      include: {
        user: true,
      },
    });
  } catch (error: any) {
    logger.error('Failed to create audit log:', {
      error: error.message,
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
    });
    throw error;
  }
};

const getAuditLogs = async (filters: AuditLogFilters): Promise<any> => {
  const { limit = 50, offset = 0, ...whereFilters } = filters;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        userId: whereFilters.userId,
        action: whereFilters.action
          ? {
              in: whereFilters.action,
            }
          : undefined,
        timestamp: {
          gte: whereFilters.startDate,
          lte: whereFilters.endDate,
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({
      where: {
        userId: whereFilters.userId,
        action: whereFilters.action
          ? {
              in: whereFilters.action,
            }
          : undefined,
        timestamp: {
          gte: whereFilters.startDate,
          lte: whereFilters.endDate,
        },
      },
    }),
  ]);

  return {
    logs,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + logs.length < total,
    },
  };
};

const getEntityAuditTrail = async (entityType: string, entityId: number): Promise<any> => {
  return prisma.auditLog.findMany({
    where: {
      projectId: entityId,
    },
    include: {
      user: true,
    },
    orderBy: {
      timestamp: 'desc',
    },
  });
};

const getEntityAuditLogs = async (
  entityType: string,
  entityId: number,
  filters: AuditLogFilters,
): Promise<any> => {
  const { limit = 50, offset = 0, ...whereFilters } = filters;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        projectId: entityType === 'project' ? entityId : undefined,
        userId: whereFilters.userId,
        action: whereFilters.action
          ? {
              in: whereFilters.action,
            }
          : undefined,
        timestamp: {
          gte: whereFilters.startDate,
          lte: whereFilters.endDate,
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({
      where: {
        projectId: entityType === 'project' ? entityId : undefined,
        userId: whereFilters.userId,
        action: whereFilters.action
          ? {
              in: whereFilters.action,
            }
          : undefined,
        timestamp: {
          gte: whereFilters.startDate,
          lte: whereFilters.endDate,
        },
      },
    }),
  ]);

  return {
    logs,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + logs.length < total,
    },
  };
};

const getUserAuditLogs = async (userId: number, filters: AuditLogFilters): Promise<any> => {
  const { limit = 50, offset = 0, ...whereFilters } = filters;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        userId,
        action: whereFilters.action
          ? {
              in: whereFilters.action,
            }
          : undefined,
        timestamp: {
          gte: whereFilters.startDate,
          lte: whereFilters.endDate,
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({
      where: {
        userId,
        action: whereFilters.action
          ? {
              in: whereFilters.action,
            }
          : undefined,
        timestamp: {
          gte: whereFilters.startDate,
          lte: whereFilters.endDate,
        },
      },
    }),
  ]);

  return {
    logs,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + logs.length < total,
    },
  };
};

const getUserActivityReport = async (
  userId: number,
  startDate: Date,
  endDate: Date,
): Promise<AuditLogSummary> => {
  const logs = await prisma.auditLog.findMany({
    where: {
      userId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      timestamp: 'desc',
    },
  });

  // Group actions by type
  const actionSummary = logs.reduce((acc: Record<AuditActionType, number>, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<AuditActionType, number>);

  // Group actions by project
  const entitySummary = logs.reduce((acc: Record<string, number>, log) => {
    if (log.projectId) {
      acc[`Project-${log.projectId}`] = (acc[`Project-${log.projectId}`] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    user: logs[0]?.user,
    totalActions: logs.length,
    actionSummary,
    entitySummary,
    logs,
    period: {
      start: startDate,
      end: endDate,
    },
  };
};

const getSystemActivitySummary = async (
  startDate: Date,
  endDate: Date,
): Promise<SystemActivitySummary> => {
  const logs = await prisma.auditLog.findMany({
    where: {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      user: true,
    },
  });

  // Group by date
  const dailyActivity = logs.reduce((acc: Record<string, number>, log) => {
    const date = log.timestamp.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Group by user
  const userActivity = logs.reduce((acc: Record<number, number>, log) => {
    acc[log.userId] = (acc[log.userId] || 0) + 1;
    return acc;
  }, {});

  // Group by action type
  const actionSummary = logs.reduce((acc: Record<AuditActionType, number>, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<AuditActionType, number>);

  return {
    totalActions: logs.length,
    dailyActivity,
    userActivity,
    actionSummary,
    period: {
      start: startDate,
      end: endDate,
    },
  };
};

const createLoginAudit = async (auditData: LoginAuditData) => {
  try {
    // Fetch geo location data
    let geo: GeoData = {};
    try {
      const { data } = await axios.get(`https://ipapi.co/${auditData.ip}/json/`);
      geo = data;
    } catch (err) {
      logger.error('IPAPI fetch failed:', err);
    }

    // Create login audit record
    return prisma.userLoginAudit.create({
      data: {
        userId: auditData.userId,
        email: auditData.email,
        ip: auditData.ip,
        userAgent: auditData.userAgent,
        platform: auditData.platform,
        host: auditData.host,
        organization: geo?.org,
        asn: geo?.asn,
        city: geo?.city,
        region: geo?.region,
        country: geo?.country_name,
        latitude: geo?.latitude,
        longitude: geo?.longitude,
        timezone: geo?.timezone,
        currency: geo?.currency,
        language: geo?.languages?.split(',')[0],
      },
    });
  } catch (error) {
    logger.error('Failed to create login audit:', error);
    throw error;
  }
};

const hasLoggedInBefore = async (userId: number): Promise<boolean> => {
  const audit = await prisma.userLoginAudit.findFirst({
    where: { userId },
  });
  return !!audit;
};

export default {
  logAction,
  getAuditLogs,
  getEntityAuditTrail,
  getEntityAuditLogs,
  getUserAuditLogs,
  getUserActivityReport,
  getSystemActivitySummary,
  createLoginAudit,
  hasLoggedInBefore,
};
