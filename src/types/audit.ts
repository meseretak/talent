/**
 * Enum representing different types of audit actions
 */
export enum AuditActionType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  VERIFY = 'VERIFY',
  RESET_PASSWORD = 'RESET_PASSWORD',
  VIEW = 'VIEW',
  UPLOAD = 'UPLOAD',
  DOWNLOAD = 'DOWNLOAD',
  PAYMENT = 'PAYMENT',
  SUBSCRIPTION = 'SUBSCRIPTION',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  OTHER = 'OTHER',
}

/**
 * Interface for audit log entry
 */
export interface AuditLog {
  id: number;
  userId: number;
  action: AuditActionType;
  entityType: string;
  entityId?: number | string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Interface for creating an audit log entry
 */
export interface CreateAuditLogDto {
  userId: number;
  action: AuditActionType;
  entityType: string;
  entityId?: number | string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Interface for audit log search/filtering parameters
 */
export interface AuditLogQuery {
  userId?: number;
  action?: AuditActionType | AuditActionType[];
  entityType?: string;
  entityId?: number | string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}
