import express from 'express';
import type { NextFunction, Request, RequestHandler, Response } from 'express-serve-static-core';
import multer from 'multer';
import upload from '../../config/multer';
import { chatController } from '../../controllers/v1';
import type { User } from '../../generated/prisma';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import chatValidation from '../../validations/chat.validation';

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

// Chat Room Management
router
  .route('/rooms')
  .post(
    auth('chat'),
    validate(chatValidation.createChatRoom),
    assertAuthHandler(chatController.createChatRoom),
  )
  .get(
    auth('chat'),
    validate(chatValidation.getUserChatRooms),
    assertAuthHandler(chatController.getUserChatRooms),
  );

router
  .route('/rooms/search')
  .get(
    auth('chat'),
    validate(chatValidation.searchChatRooms),
    assertAuthHandler(chatController.searchChatRooms),
  );

router
  .route('/rooms/:id')
  .get(
    auth('chat'),
    validate(chatValidation.getChatRoom),
    assertAuthHandler(chatController.getChatRoom),
  )
  .put(
    auth('chat'),
    validate(chatValidation.updateChatRoom),
    assertAuthHandler(chatController.updateChatRoom),
  )
  .delete(
    auth('chat'),
    validate(chatValidation.deleteChatRoom),
    assertAuthHandler(chatController.deleteChatRoom),
  );

router
  .route('/rooms/:id/leave')
  .post(
    auth('chat'),
    validate(chatValidation.leaveChatRoom),
    assertAuthHandler(chatController.leaveChatRoom),
  );

router
  .route('/rooms/:id/archive')
  .post(
    auth('chat'),
    validate(chatValidation.archiveChatRoom),
    assertAuthHandler(chatController.archiveChatRoom),
  );

router
  .route('/rooms/:id/unarchive')
  .post(
    auth('chat'),
    validate(chatValidation.unarchiveChatRoom),
    assertAuthHandler(chatController.unarchiveChatRoom),
  );

router
  .route('/rooms/archived')
  .get(
    auth('chat'),
    validate(chatValidation.getArchivedChatRooms),
    assertAuthHandler(chatController.getArchivedChatRooms),
  );

// Room Participants Management
router
  .route('/rooms/:roomId/participants')
  .post(
    auth('chat'),
    validate(chatValidation.addParticipants),
    assertAuthHandler(chatController.addParticipants),
  );

router
  .route('/rooms/:roomId/participants/:participantId')
  .delete(
    auth('chat'),
    validate(chatValidation.removeParticipant),
    assertAuthHandler(chatController.removeParticipant),
  );

// Room Moderators Management
router
  .route('/rooms/:id/moderators')
  .post(
    auth('chat'),
    validate(chatValidation.addModerator),
    assertAuthHandler(chatController.addModerator),
  );

router
  .route('/rooms/:id/moderators/:userId')
  .delete(
    auth('chat'),
    validate(chatValidation.removeModerator),
    assertAuthHandler(chatController.removeModerator),
  );

// Room Settings & Muting
router
  .route('/rooms/:id/settings')
  .put(
    auth('chat'),
    validate(chatValidation.updateRoomSettings),
    assertAuthHandler(chatController.updateRoomSettings),
  );

router
  .route('/rooms/:id/mute')
  .post(
    auth('chat'),
    validate(chatValidation.muteRoom),
    assertAuthHandler(chatController.muteRoom),
  );

router
  .route('/rooms/:id/unmute')
  .delete(
    auth('chat'),
    validate(chatValidation.unmuteRoom),
    assertAuthHandler(chatController.unmuteRoom),
  );

// Message Management
router
  .route('/rooms/:roomId/messages')
  .post(
    auth('chat'),
    validate(chatValidation.sendMessage),
    assertAuthHandler(chatController.sendMessage),
  )
  .get(
    auth('chat'),
    validate(chatValidation.getRoomMessages),
    assertAuthHandler(chatController.getRoomMessages),
  );

router
  .route('/messages/search')
  .get(
    auth('chat'),
    validate(chatValidation.searchMessages),
    assertAuthHandler(chatController.searchMessages),
  );

router
  .route('/messages/:messageId')
  .put(
    auth('chat'),
    validate(chatValidation.editMessage),
    assertAuthHandler(chatController.editMessage),
  )
  .delete(
    auth('chat'),
    validate(chatValidation.deleteMessage),
    assertAuthHandler(chatController.deleteMessage),
  );

// Message Reactions
router
  .route('/messages/:messageId/reactions')
  .post(
    auth('chat'),
    validate(chatValidation.addMessageReaction),
    assertAuthHandler(chatController.addMessageReaction),
  )
  .delete(
    auth('chat'),
    validate(chatValidation.removeMessageReaction),
    assertAuthHandler(chatController.removeMessageReaction),
  );

// Message Replies & Forwarding
router
  .route('/messages/:messageId/reply')
  .post(
    auth('chat'),
    validate(chatValidation.replyToMessage),
    assertAuthHandler(chatController.replyToMessage),
  );

router
  .route('/messages/:messageId/forward')
  .post(
    auth('chat'),
    validate(chatValidation.forwardMessage),
    assertAuthHandler(chatController.forwardMessage),
  );

router
  .route('/messages/:messageId/replies')
  .get(
    auth('chat'),
    validate(chatValidation.getMessageReplies),
    assertAuthHandler(chatController.getMessageReplies),
  );

// Message Status
router
  .route('/messages/:messageId/status')
  .put(
    auth('chat'),
    validate(chatValidation.updateMessageStatus),
    assertAuthHandler(chatController.updateMessageStatus),
  )
  .get(
    auth('chat'),
    validate(chatValidation.getMessageStatus),
    assertAuthHandler(chatController.getMessageStatus),
  );

// File Attachments
router
  .route('/rooms/:roomId/attachments')
  .post(
    auth('chat'),
    (req, res, next) => {
      upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 100MB.',
            });
          }
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        } else if (err) {
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }
        next();
      });
    },
    validate(chatValidation.uploadAttachment),
    assertAuthHandler(chatController.uploadAttachment),
  )
  .get(
    auth('chat'),
    validate(chatValidation.getRoomAttachments),
    assertAuthHandler(chatController.getRoomAttachments),
  );

// Delete specific attachment
router
  .route('/rooms/:roomId/attachments/:messageId')
  .delete(
    auth('chat'),
    validate(chatValidation.deleteAttachment),
    assertAuthHandler(chatController.deleteAttachment),
  );

// Message Reporting
router
  .route('/messages/:messageId/report')
  .post(
    auth('chat'),
    validate(chatValidation.reportMessage),
    assertAuthHandler(chatController.reportMessage),
  );

// Analytics
router
  .route('/analytics')
  .get(
    auth('chat'),
    validate(chatValidation.getChatAnalytics),
    assertAuthHandler(chatController.getChatAnalytics),
  );

// Message Read Status
router
  .route('/rooms/:roomId/messages/read')
  .post(
    auth('chat'),
    validate(chatValidation.markMessagesAsRead),
    assertAuthHandler(chatController.markMessagesAsRead),
  );

router
  .route('/messages/unread')
  .get(auth('chat'), assertAuthHandler(chatController.getUnreadMessageCount));

// Notifications
router
  .route('/notifications')
  .get(
    auth('chat'),
    validate(chatValidation.getNotifications),
    assertAuthHandler(chatController.getNotifications),
  );

router
  .route('/notifications/:id/read')
  .put(
    auth('chat'),
    validate(chatValidation.markNotificationAsRead),
    assertAuthHandler(chatController.markNotificationAsRead),
  );

router
  .route('/notifications/:id')
  .delete(
    auth('chat'),
    validate(chatValidation.deleteNotification),
    assertAuthHandler(chatController.deleteNotification),
  );

export default router;
