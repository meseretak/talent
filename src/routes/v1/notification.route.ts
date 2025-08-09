import express, { NextFunction, Request, RequestHandler, Response } from 'express';
import { notificationController } from '../../controllers/v1';
import { User } from '../../generated/prisma';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import notificationValidation from '../../validations/notification.validation';

// Type assertion helper for authenticated request handlers
const assertAuthHandler = (
  handler: (
    req: Request & { user: User },
    res: Response,
    next: NextFunction,
  ) => Promise<void> | void,
): RequestHandler => {
  return async (req, res, next) => {
    try {
      await handler(req as Request & { user: User }, res, next);
    } catch (error) {
      next(error);
    }
  };
};

const router = express.Router();

// Apply authentication to all notification routes
router.use(auth('notification'));

// Get all notifications for the authenticated user
router.get(
  '/',
  validate(notificationValidation.getNotifications),
  assertAuthHandler(notificationController.getNotifications),
);

// Get unread notifications count
router.get('/unread', assertAuthHandler(notificationController.getUnreadCount));

// Get a specific notification by ID
router.get(
  '/:id',
  validate(notificationValidation.getNotificationById),
  assertAuthHandler(notificationController.getNotificationById),
);

// Mark a notification as read
router.put(
  '/:id/read',
  validate(notificationValidation.markAsRead),
  assertAuthHandler(notificationController.markAsRead),
);

// Mark multiple notifications as read
router.put(
  '/mark-read',
  validate(notificationValidation.markManyAsRead),
  assertAuthHandler(notificationController.markManyAsRead),
);

// Track notification click
router.post(
  '/:id/click',
  validate(notificationValidation.trackClick),
  assertAuthHandler(notificationController.trackClick),
);

// Mark notification as delivered
router.post(
  '/:id/delivered',
  validate(notificationValidation.markAsDelivered),
  assertAuthHandler(notificationController.markAsDelivered),
);

// Delete a specific notification
router.delete(
  '/:id',
  validate(notificationValidation.deleteNotification),
  assertAuthHandler(notificationController.deleteNotification),
);

// Delete all read notifications
router.delete('/', assertAuthHandler(notificationController.deleteAllRead));

export default router;
