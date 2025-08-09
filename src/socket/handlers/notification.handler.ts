import { Socket, Server as SocketServer } from 'socket.io';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import logger from '../../config/logger';
import { SocketEvents, SocketUser } from '../../types/socket';
import notificationService from '../../services/communication/notification.service';

// Rate limiting configuration
const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 points
  duration: 1, // per second
});

// Rate limit error response
const rateLimitExceeded = {
  success: false,
  message: 'Rate limit exceeded. Please try again later.',
};

interface NotificationAck {
  success: boolean;
  message?: string;
  notificationId?: number | number[];
}

// Track notification delivery status
const notificationStatus = new Map<number, Set<number>>(); // notificationId -> Set<userId>

export function setupNotificationHandlers(
  io: SocketServer,
  socket: Socket,
  user: SocketUser,
): void {
  // Mark single notification as read
  socket.on(SocketEvents.READ_NOTIFICATION, async (notificationId: number, callback?: (ack: NotificationAck) => void) => {
    // Apply rate limiting
    try {
      await rateLimiter.consume(socket.id);
    } catch (rateLimiterRes) {
      logger.warn(`Rate limit exceeded for socket ${socket.id} (user ${user.id})`);
      if (callback) {
        callback(rateLimitExceeded as NotificationAck);
      } else {
        socket.emit(SocketEvents.ERROR, rateLimitExceeded);
      }
      return;
    }

    try {
      await notificationService.markAsRead(notificationId, user.id);
      
      // Acknowledge the read receipt
      if (callback) {
        callback({ 
          success: true, 
          notificationId 
        });
      }
      
      logger.info(`Notification ${notificationId} marked as read by user ${user.id}`);
    } catch (error) {
      const errorMessage = `Error marking notification as read: ${error}`;
      logger.error(errorMessage);
      
      if (callback) {
        callback({ 
          success: false, 
          message: 'Failed to mark notification as read',
          notificationId
        });
      } else {
        socket.emit(SocketEvents.ERROR, { 
          message: 'Failed to mark notification as read',
          notificationId
        });
      }
    }
  });

  // Mark multiple notifications as read
  socket.on(SocketEvents.READ_NOTIFICATIONS, async (notificationIds: number[], callback?: (ack: NotificationAck) => void) => {
    try {
      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        throw new Error('Invalid notification IDs provided');
      }

      await notificationService.markManyAsRead(notificationIds, user.id);
      
      // Acknowledge the read receipts
      if (callback) {
        callback({ 
          success: true, 
          notificationId: notificationIds 
        });
      }
      
      logger.info(`Marked ${notificationIds.length} notifications as read for user ${user.id}`);
    } catch (error) {
      const errorMessage = `Error marking notifications as read: ${error}`;
      logger.error(errorMessage);
      
      if (callback) {
        callback({ 
          success: false, 
          message: 'Failed to mark notifications as read',
          notificationId: notificationIds
        });
      } else {
        socket.emit(SocketEvents.ERROR, { 
          message: 'Failed to mark notifications as read',
          notificationIds
        });
      }
    }
  });

  // Handle notification delivery confirmation
  socket.on(SocketEvents.NOTIFICATION_DELIVERED, (notificationId: number) => {
    try {
      if (!notificationStatus.has(notificationId)) {
        notificationStatus.set(notificationId, new Set());
      }
      notificationStatus.get(notificationId)?.add(user.id);
      
      // In a real app, you might want to update the delivery status in the database
      notificationService.markAsDelivered(notificationId, user.id).catch(error => {
        logger.error(`Error updating notification delivery status: ${error}`);
      });
      
    } catch (error) {
      logger.error(`Error processing notification delivery: ${error}`);
    }
  });

  // Handle notification click tracking
  socket.on(SocketEvents.NOTIFICATION_CLICKED, (notificationId: number) => {
    try {
      // Update click tracking in the database
      notificationService.trackClick(notificationId, user.id).catch(error  => {
        logger.error(`Error tracking notification click: ${error}`);
      });
      
      logger.info(`User ${user.id} clicked notification ${notificationId}`);
    } catch (error) {
      logger.error(`Error processing notification click: ${error}`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Clean up any notification tracking for this user
    notificationStatus.forEach((userIds, notificationId) => {
      if (userIds.has(user.id)) {
        userIds.delete(user.id);
        if (userIds.size === 0) {
          notificationStatus.delete(notificationId);
        }
      }
    });
    
    logger.info(`User ${user.id} disconnected from notifications`);
  });
}

// Utility function to send a notification to a specific user
export function sendUserNotification(
  io: SocketServer,
  userId: number,
  notification: {
    id: number;
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    createdAt: Date;
  },
): void {
  io.to(`user:${userId}`).emit(SocketEvents.NEW_NOTIFICATION, notification);
}

// Utility function to broadcast a notification to multiple users
export function broadcastNotification(
  io: SocketServer,
  userIds: number[],
  notification: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  },
): void {
  userIds.forEach(userId => {
    io.to(`user:${userId}`).emit(SocketEvents.NEW_NOTIFICATION, {
      ...notification,
      createdAt: new Date(),
    });
  });
}
