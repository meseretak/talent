import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { NotificationType, User } from '../../../generated/prisma';
import notificationService from '../../../services/communication/notification.service';
import ApiError from '../../../utils/ApiError';
import { successResponse } from '../../../utils/apiResponse';

// Define AuthenticatedRequest interface
interface AuthenticatedRequest extends Request {
  user: User;
}

// Update the catchAsync function type or create a typed version
const typedCatchAsync =
  <T extends Request>(fn: (req: T, res: Response) => Promise<any>) =>
  (req: T, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };

class NotificationController {
  /**
   * Get all notifications for the authenticated user
   */
  getNotifications = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      read,
      type,
      entityType,
      entityId,
    } = req.query;

    const options = {
      page: Number(page),
      limit: Number(limit),
      sortBy: String(sortBy),
      sortOrder: sortOrder as 'asc' | 'desc',
      read: read !== undefined ? read === 'true' : undefined,
      type: type as NotificationType | undefined,
      entityType: entityType as string | undefined,
      entityId: entityId ? Number(entityId) : undefined,
    };

    const result = await notificationService.getUserNotifications(req.user.id, options);

    res.json(
      successResponse(
        {
          notifications: result.data,
          pagination: {
            total: result.total,
            page: options.page,
            limit: options.limit,
            totalPages: Math.ceil(result.total / options.limit),
            hasMore: options.page * options.limit < result.total,
          },
        },
        'Notifications retrieved successfully',
      ),
    );
  });

  /**
   * Get a specific notification by ID
   */
  getNotificationById = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const notificationId = Number(req.params.id);
    const notification = await notificationService.getNotificationById(notificationId, req.user.id);

    if (!notification) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
    }

    res.json(successResponse(notification, 'Notification retrieved successfully'));
  });

  /**
   * Mark a notification as read
   */
  markAsRead = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const notificationId = Number(req.params.id);
    const notification = await notificationService.markAsRead(notificationId, req.user.id);

    res.json(successResponse(notification, 'Notification marked as read successfully'));
  });

  /**
   * Mark multiple notifications as read
   */
  markManyAsRead = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'notificationIds array is required');
    }

    const result = await notificationService.markManyAsRead(notificationIds, req.user.id);

    res.json(successResponse(result, `${result.count} notifications marked as read successfully`));
  });

  /**
   * Get unread notifications count
   */
  getUnreadCount = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const unreadNotifications = await notificationService.getUnreadNotifications(req.user.id);

    res.json(
      successResponse(
        {
          count: unreadNotifications.length,
          notifications: unreadNotifications,
        },
        'Unread notifications retrieved successfully',
      ),
    );
  });

  /**
   * Delete a notification
   */
  deleteNotification = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const notificationId = Number(req.params.id);
    await notificationService.deleteNotification(notificationId, req.user.id);

    res.json(successResponse(null, 'Notification deleted successfully'));
  });

  /**
   * Delete all read notifications
   */
  deleteAllRead = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const result = await notificationService.deleteAllRead(req.user.id);

    res.json(successResponse(result, `${result.count} read notifications deleted successfully`));
  });

  /**
   * Track notification click
   */
  trackClick = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const notificationId = Number(req.params.id);
    await notificationService.trackClick(notificationId, req.user.id);

    res.json(successResponse(null, 'Notification click tracked successfully'));
  });

  /**
   * Mark notification as delivered
   */
  markAsDelivered = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const notificationId = Number(req.params.id);
    await notificationService.markAsDelivered(notificationId, req.user.id);

    res.json(successResponse(null, 'Notification marked as delivered successfully'));
  });
}

export default new NotificationController();
