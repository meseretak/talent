import httpStatus from 'http-status';
import { NotificationType, Prisma, PrismaClient } from '../../generated/prisma';
import prisma from '../../client';
import ApiError from '../../utils/ApiError';
import logger from '../../config/logger';

// Types
type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  role: string;
  status: string;
};

type Notification = {
  id: number;
  type: string;
  content: string;
  readAt: Date | null;
  recipientId: number;
  senderId: number | null;
  userId: number;
  entityType: string;
  entityId: number;
  createdAt: Date;
  updatedAt: Date;
};

// Type for notification with relations
export type NotificationWithRelations = Notification & {
  sender?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'avatar'> | null;
  recipient: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'avatar'>;
};

// Pagination options type
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

type NotificationFilter = {
  read?: boolean;
  type?: NotificationType;
  recipientId?: number;
  entityType?: string;
  entityId?: number;
};

class NotificationService {
  private prisma: Prisma.TransactionClient;

  constructor(prismaClient?: Prisma.TransactionClient) {
    this.prisma = prismaClient || prisma;
  }

  /**
   * Create a new notification
   * @param {Object} data - Notification data
   * @returns {Promise<NotificationWithRelations>}
   */
  async createNotification(data: {
    type: NotificationType;
    content: string;
    recipientId: number;
    senderId?: number;
    entityType: string;
    entityId: number;
  }): Promise<NotificationWithRelations> {
    try {
      return await this.prisma.notification.create({
        data: {
          type: data.type,
          content: data.content,
          recipient: { connect: { id: data.recipientId } },
          sender: data.senderId ? { connect: { id: data.senderId } } : undefined,
          user: { connect: { id: data.recipientId } }, // Link to user for easier querying
          entityType: data.entityType,
          entityId: data.entityId,
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
          },
          recipient: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
          },
        },
      });
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create notification'
      );
    }
  }

  /**
   * Get notification by ID
   * @param {number} id - Notification ID
   * @param {number} userId - User ID for authorization
   * @returns {Promise<NotificationWithRelations | null>}
   */
  async getNotificationById(id: number, userId: number): Promise<NotificationWithRelations | null> {
    try {
      const notification = await this.prisma.notification.findUnique({
        where: { id },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
          },
          recipient: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
          },
        },
      });

      if (!notification) {
        return null;
      }

      // Only the recipient can view the notification
      if (notification.recipientId !== userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to view this notification');
      }

      return notification;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error fetching notification:', error);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to fetch notification'
      );
    }
  }

  /**
   * Mark a notification as read
   * @param {number} notificationId - Notification ID
   * @param {number} userId - User ID for verification
   * @returns {Promise<NotificationWithRelations>}
   */
  async markAsRead(notificationId: number, userId: number): Promise<NotificationWithRelations> {
    try {
      const notification = await this.prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
      }

      if (notification.recipientId !== userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to update this notification');
      }

      if (notification.readAt) {
        return this.getNotificationById(notificationId, userId) as Promise<NotificationWithRelations>;
      }

      const updated = await this.prisma.notification.update({
        where: { id: notificationId },
        data: { 
          readAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
          },
          recipient: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
          },
        },
      });

      return updated;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error marking notification as read:', error);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to mark notification as read'
      );
    }
  }

  /**
   * Mark multiple notifications as read
   * @param {number[]} notificationIds - Array of notification IDs
   * @param {number} userId - User ID for verification
   * @returns {Promise<{ count: number }>}
   */
  async markManyAsRead(notificationIds: number[], userId: number): Promise<{ count: number }> {
    try {
      // Verify all notifications belong to the user
      const count = await this.prisma.notification.count({
        where: {
          id: { in: notificationIds },
          recipientId: userId,
        },
      });

      if (count !== notificationIds.length) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to update one or more notifications');
      }

      const result = await this.prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          readAt: null, // Only update if not already read
        },
        data: { 
          readAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return { count: result.count };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error marking notifications as read:', error);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to mark notifications as read'
      );
    }
  }

  /**
   * Mark a notification as delivered
   * @param {number} notificationId - Notification ID
   * @param {number} userId - User ID for verification
   * @returns {Promise<void>}
   */
  async markAsDelivered(notificationId: number, userId: number): Promise<void> {
    try {
      await this.prisma.notification.updateMany({
        where: { 
          id: notificationId, 
          recipientId: userId,
        },
        data: { 
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error marking notification as delivered:', error);
      // Don't throw error for delivery tracking failures
    }
  }

  /**
   * Track notification click
   * @param {number} notificationId - Notification ID
   * @param {number} userId - User ID for verification
   * @returns {Promise<void>}
   */
  async trackClick(notificationId: number, userId: number): Promise<void> {
    try {
      await this.prisma.notification.updateMany({
        where: { 
          id: notificationId, 
          recipientId: userId,
        },
        data: { 
          readAt: new Date(), // Mark as read when clicked
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error tracking notification click:', error);
      // Don't throw error for click tracking failures
    }
  }

  /**
   * Get user's unread notifications
   * @param {number} userId - User ID
   * @returns {Promise<NotificationWithRelations[]>}
   */
  async getUnreadNotifications(userId: number): Promise<NotificationWithRelations[]> {
    try {
      return await this.prisma.notification.findMany({
        where: { 
          recipientId: userId, 
          readAt: null,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
          },
          recipient: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
          },
        },
      });
    } catch (error) {
      logger.error('Error fetching unread notifications:', error);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to fetch unread notifications'
      );
    }
  }

  /**
   * Get user's notifications with pagination
   * @param {number} userId - User ID
   * @param {Object} options - Pagination and filtering options
   * @returns {Promise<{ data: NotificationWithRelations[]; total: number }>}
   */
  async getUserNotifications(
    userId: number,
    options: PaginationOptions & NotificationFilter = {}
  ): Promise<{ data: NotificationWithRelations[]; total: number }> {
    try {
      const { 
        page = 1, 
        limit = 20, 
        sortBy = 'createdAt', 
        sortOrder = 'desc',
        read,
        type,
        entityType,
        entityId,
      } = options;
      
      const skip = (page - 1) * limit;
      
      const where: any = { recipientId: userId };

      if (read !== undefined) {
        where.readAt = read ? { not: null } : null;
      }

      if (type) {
        where.type = type;
      }

      if (entityType) {
        where.entityType = entityType;
      }

      if (entityId) {
        where.entityId = entityId;
      }

      const [data, total] = await Promise.all([
        this.prisma.notification.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
          include: {
            sender: {
              select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
            },
            recipient: {
              select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
            },
          },
        }),
        this.prisma.notification.count({ where }),
      ]);

      return { data, total };
    } catch (error) {
      logger.error('Error fetching user notifications:', error);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to fetch notifications'
      );
    }
  }

  /**
   * Delete a notification
   * @param {number} notificationId - Notification ID
   * @param {number} userId - User ID for verification
   * @returns {Promise<void>}
   */
  async deleteNotification(notificationId: number, userId: number): Promise<void> {
    try {
      const notification = await this.prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
      }

      if (notification.recipientId !== userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to delete this notification');
      }

      await this.prisma.notification.delete({
        where: { id: notificationId },
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error deleting notification:', error);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete notification'
      );
    }
  }

  /**
   * Delete all read notifications for a user
   * @param {number} userId - User ID
   * @returns {Promise<{ count: number }>}
   */
  async deleteAllRead(userId: number): Promise<{ count: number }> {
    try {
      const result = await this.prisma.notification.deleteMany({
        where: { 
          recipientId: userId, 
          readAt: { not: null },
        },
      });
      return { count: result.count };
    } catch (error) {
      logger.error('Error deleting read notifications:', error);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete read notifications'
      );
    }
  }
}

// Export both the class and a singleton instance
export { NotificationService };

// Export a singleton instance for default usage
export default new NotificationService();
