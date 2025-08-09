import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { auditService, chatService } from '../../../services';
import { successResponse } from '../../../utils/apiResponse';

import prisma from '../../../client';
import { AuditActionType, NotificationType } from '../../../generated/prisma';
import notificationService from '../../../services/communication/notification.service';

import ApiError from '../../../utils/ApiError';

// Define AuthenticatedRequest interface
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
  };
}

// Update the catchAsync function type or create a typed version
const typedCatchAsync =
  <T extends Request>(fn: (req: T, res: Response) => Promise<any>) =>
  (req: T, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };

class ChatController {
  createChatRoom = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const chatRoom = await chatService.createChatRoom({
      name: req.body.name, // Add required name field
      description: req.body.description,
      projectId: req.body.projectId,
      metadata: req.body.metadata,
      settings: req.body.settings,
      participantIds: [...req.body.participantIds, req.user.id], // Include the creator
    });

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.CREATE,
      entityType: 'chat_room',
      entityId: chatRoom.id,
      details: `Created chat room: ${chatRoom.name}`,
    });

    // Create notifications for new participants
    try {
      const participantIds = req.body.participantIds || [];
      for (const participantId of participantIds) {
        if (participantId !== req.user.id) {
          await notificationService.createNotification({
            type: NotificationType.CHAT,
            content: `You have been added to the chat room "${chatRoom.name}"`,
            recipientId: participantId,
            senderId: req.user.id,
            entityType: 'chat_room',
            entityId: chatRoom.id,
          });
        }
      }
    } catch (error) {
      console.error('Failed to create notification for chat room creation:', error);
    }

    res
      .status(httpStatus.CREATED)
      .json(successResponse(chatRoom, 'Chat room created successfully'));
  });

  getChatRoom = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.id);
    const room = await chatService.getChatRoomById(roomId);

    // Verify user is a participant
    if (!room.participants.some((p) => p.id === req.user.id)) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Not a participant of this chat room');
    }

    res.json(successResponse(room, 'Chat room retrieved successfully'));
  });

  updateChatRoom = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.id);
    const room = await chatService.updateChatRoom(roomId, req.body, req.user.id);

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.UPDATE,
      entityType: 'chat_room',
      entityId: room.id,
      details: `Updated chat room: ${room.name}`,
    });

    // Create notification for chat room update
    try {
      const participants = room.participants || [];
      for (const participant of participants) {
        if (participant.id !== req.user.id) {
          await notificationService.createNotification({
            type: NotificationType.CHAT,
            content: `Chat room "${room.name}" has been updated`,
            recipientId: participant.id,
            senderId: req.user.id,
            entityType: 'chat_room',
            entityId: room.id,
          });
        }
      }
    } catch (error) {
      console.error('Failed to create notification for chat room update:', error);
    }

    res.json(successResponse(room, 'Chat room updated successfully'));
  });

  deleteChatRoom = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.id);
    const room = await chatService.getChatRoomById(roomId);
    await chatService.deleteChatRoom(roomId, req.user.id);

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.DELETE,
      entityType: 'chat_room',
      entityId: roomId,
      details: `Deleted chat room`,
    });

    // Create notification for chat room deletion
    try {
      const participants = room.participants || [];
      for (const participant of participants) {
        if (participant.id !== req.user.id) {
          await notificationService.createNotification({
            type: NotificationType.CHAT,
            content: `Chat room "${room.name}" has been deleted`,
            recipientId: participant.id,
            senderId: req.user.id,
            entityType: 'chat_room',
            entityId: roomId,
          });
        }
      }
    } catch (error) {
      console.error('Failed to create notification for chat room deletion:', error);
    }

    res.status(httpStatus.NO_CONTENT).json(successResponse(null, 'Chat room deleted successfully'));
  });

  leaveChatRoom = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.id);
    const room = await chatService.getChatRoomById(roomId);
    await chatService.leaveChatRoom(roomId, req.user.id);

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.UPDATE,
      entityType: 'chat_room',
      entityId: roomId,
      details: `Left chat room`,
    });

    // Create notification for leaving chat room
    try {
      const participants = room.participants || [];
      for (const participant of participants) {
        if (participant.id !== req.user.id) {
          await notificationService.createNotification({
            type: NotificationType.CHAT,
            content: `A participant has left the chat room "${room.name}"`,
            recipientId: participant.id,
            senderId: req.user.id,
            entityType: 'chat_room',
            entityId: roomId,
          });
        }
      }
    } catch (error) {
      console.error('Failed to create notification for leaving chat room:', error);
    }

    res.status(httpStatus.NO_CONTENT).json(successResponse(null, 'Chat room deleted successfully'));
  });

  archiveChatRoom = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.id);
    const room = await chatService.archiveChatRoom(roomId, req.user.id);

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.UPDATE,
      entityType: 'chat_room',
      entityId: room.id,
      details: `Archived chat room`,
    });

    // Create notification for chat room archiving
    try {
      const participants = room.participants || [];
      for (const participant of participants) {
        if (participant.id !== req.user.id) {
          await notificationService.createNotification({
            type: NotificationType.CHAT,
            content: `Chat room "${room.name}" has been archived`,
            recipientId: participant.id,
            senderId: req.user.id,
            entityType: 'chat_room',
            entityId: room.id,
          });
        }
      }
    } catch (error) {
      console.error('Failed to create notification for chat room archiving:', error);
    }

    res.json(successResponse(room, 'Chat room archived successfully'));
  });

  unarchiveChatRoom = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.id);
    const room = await chatService.unarchiveChatRoom(roomId, req.user.id);

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.UPDATE,
      entityType: 'chat_room',
      entityId: room.id,
      details: `Unarchived chat room`,
    });

    // Create notification for chat room unarchiving
    try {
      const participants = room.participants || [];
      for (const participant of participants) {
        if (participant.id !== req.user.id) {
          await notificationService.createNotification({
            type: NotificationType.CHAT,
            content: `Chat room "${room.name}" has been unarchived`,
            recipientId: participant.id,
            senderId: req.user.id,
            entityType: 'chat_room',
            entityId: room.id,
          });
        }
      }
    } catch (error) {
      console.error('Failed to create notification for chat room unarchiving:', error);
    }

    res.json(successResponse(room, 'Chat room archived successfully'));
  });

  getArchivedChatRooms = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const rooms = await chatService.getArchivedChatRooms(req.user.id);
    res.json(successResponse(rooms, 'Archived chat rooms retrieved successfully'));
  });

  getUserChatRooms = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const rooms = await chatService.getUserChatRooms(req.user.id);
    res.json(successResponse(rooms, 'User chat rooms retrieved successfully'));
  });

  searchChatRooms = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const { query, limit, page } = req.query;
    const currentPage = page ? Number(page) : 1;
    const currentLimit = limit ? Number(limit) : 20;

    const rooms = await chatService.searchChatRooms(req.user.id, {
      query: query as string,
      limit: currentLimit,
      page: currentPage,
    });

    // For now, we'll use a simple response since we don't have total count
    // In a real implementation, you'd want to get the total count from the service
    res.json(successResponse(rooms, 'Chat rooms search completed successfully'));
  });

  sendMessage = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.roomId);

    // Validate message content - allow empty content if there's an attachment
    if ((!req.body.content || req.body.content.trim().length === 0) && !req.body.attachmentUrl) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Message content cannot be empty unless there is an attachment',
      );
    }

    // Verify user is a participant of the room
    const room = await chatService.getChatRoomById(roomId);
    if (!room.participants.some((p) => p.id === req.user.id)) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Not a participant of this chat room');
    }

    const message = await chatService.sendMessage({
      roomId,
      senderId: req.user.id,
      message: req.body.content?.trim() || '',
      metadata: req.body.attachmentUrl ? { attachmentUrl: req.body.attachmentUrl } : undefined,
      sentAt: new Date(),
      status: 'sent',
    });

    // Create notifications for new messages
    try {
      const participants = room.participants || [];
      for (const participant of participants) {
        if (participant.id !== req.user.id) {
          const messagePreview = req.body.content?.trim() || 'Sent an attachment';
          const truncatedMessage =
            messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview;

          await notificationService.createNotification({
            type: NotificationType.CHAT,
            content: `New message in "${room.name}": ${truncatedMessage}`,
            recipientId: participant.id,
            senderId: req.user.id,
            entityType: 'chat_room',
            entityId: roomId,
          });
        }
      }
    } catch (error) {
      console.error('Failed to create notification for new message:', error);
    }

    // Don't log chat messages to audit log to maintain privacy
    res.status(httpStatus.CREATED).json(successResponse(message, 'Message sent successfully'));
  });

  editMessage = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const messageId = Number(req.params.messageId);
    const message = await chatService.editMessage(messageId, req.user.id, req.body.content);

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.UPDATE,
      entityType: 'chat_message',
      entityId: message.id,
      details: `Edited message in room ${message.roomId}`,
    });

    res.json(successResponse(message, 'Message edited successfully'));
  });

  deleteMessage = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const messageId = Number(req.params.messageId);
    await chatService.deleteMessage(messageId, req.user.id);

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.DELETE,
      entityType: 'chat_message',
      entityId: messageId,
      details: `Deleted message`,
    });

    res.status(httpStatus.NO_CONTENT).json(successResponse(null, 'Message deleted successfully'));
  });

  addMessageReaction = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const messageId = Number(req.params.messageId);
    const { emoji } = req.body;
    const reaction = await chatService.addMessageReaction(messageId, req.user.id, emoji);

    // Create notification for message reaction
    try {
      // Get message information directly from Prisma
      const message = await prisma.chatMessage.findUnique({
        where: { id: messageId },
        select: { senderId: true },
      });

      if (message && message.senderId && message.senderId !== req.user.id) {
        await notificationService.createNotification({
          type: NotificationType.CHAT,
          content: `Someone reacted with ${emoji} to your message`,
          recipientId: message.senderId,
          senderId: req.user.id,
          entityType: 'chat_message',
          entityId: messageId,
        });
      }
    } catch (error) {
      console.error('Failed to create notification for message reaction:', error);
    }

    res
      .status(httpStatus.CREATED)
      .json(successResponse(reaction, 'Message reaction added successfully'));
  });

  removeMessageReaction = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const messageId = Number(req.params.messageId);
    const { emoji } = req.body;
    await chatService.removeMessageReaction(messageId, req.user.id, emoji);

    res
      .status(httpStatus.NO_CONTENT)
      .json(successResponse(null, 'Message reaction removed successfully'));
  });

  replyToMessage = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const messageId = Number(req.params.messageId);
    const reply = await chatService.replyToMessage(messageId, req.user.id, req.body.content);

    // Create notification for message reply
    try {
      // Get message information directly from Prisma
      const originalMessage = await prisma.chatMessage.findUnique({
        where: { id: messageId },
        select: { senderId: true },
      });

      if (originalMessage && originalMessage.senderId && originalMessage.senderId !== req.user.id) {
        await notificationService.createNotification({
          type: NotificationType.CHAT,
          content: `Someone replied to your message`,
          recipientId: originalMessage.senderId,
          senderId: req.user.id,
          entityType: 'chat_message',
          entityId: messageId,
        });
      }
    } catch (error) {
      console.error('Failed to create notification for message reply:', error);
    }

    res.status(httpStatus.CREATED).json(successResponse(reply, 'Message reply sent successfully'));
  });

  forwardMessage = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const messageId = Number(req.params.messageId);
    const { roomIds } = req.body;
    const forwardedMessages = await chatService.forwardMessage(messageId, req.user.id, roomIds);

    res
      .status(httpStatus.CREATED)
      .json(successResponse(forwardedMessages, 'Message forwarded successfully'));
  });

  getMessageReplies = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const messageId = Number(req.params.messageId);
    const replies = await chatService.getMessageReplies(messageId);

    res.json(successResponse(replies, 'Message replies retrieved successfully'));
  });

  getRoomMessages = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.roomId);
    const { limit, before, after } = req.query;

    // Verify user is a participant
    const room = await chatService.getChatRoomById(roomId);
    if (!room.participants.some((p) => p.id === req.user.id)) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Not a participant of this chat room');
    }

    const messages = await chatService.getRoomMessages(roomId, {
      limit: limit ? Number(limit) : undefined,
      before: before ? new Date(before as string) : undefined,
      after: after ? new Date(after as string) : undefined,
    });

    res.json(successResponse(messages, 'Room messages retrieved successfully'));
  });

  searchMessages = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const { query, roomId, limit, page } = req.query;
    const messages = await chatService.searchMessages(req.user.id, {
      query: query as string,
      roomId: roomId ? Number(roomId) : undefined,
      limit: limit ? Number(limit) : 20,
      page: page ? Number(page) : 1,
    });

    res.json(successResponse(messages, 'Messages search completed successfully'));
  });

  updateMessageStatus = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const messageId = Number(req.params.messageId);
    await chatService.updateMessageStatus(messageId, req.body);

    res
      .status(httpStatus.NO_CONTENT)
      .json(successResponse(null, 'Message status updated successfully'));
  });

  getMessageStatus = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const messageId = Number(req.params.messageId);
    const status = await chatService.getMessageStatus(messageId);

    res.json(successResponse(status, 'Message status retrieved successfully'));
  });

  addParticipants = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.roomId);
    const room = await chatService.addParticipantsToRoom(roomId, req.body.participantIds);

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.UPDATE,
      entityType: 'chat_room',
      entityId: room.id,
      details: `Added participants to chat room`,
    });

    // Create notifications for new participants
    try {
      const participantIds = req.body.participantIds || [];
      for (const participantId of participantIds) {
        await notificationService.createNotification({
          type: NotificationType.CHAT,
          content: `You have been added to the chat room "${room.name}"`,
          recipientId: participantId,
          senderId: req.user.id,
          entityType: 'chat_room',
          entityId: room.id,
        });
      }
    } catch (error) {
      console.error('Failed to create notification for adding participants:', error);
    }

    res.json(successResponse(room, 'Participants added to chat room successfully'));
  });

  removeParticipant = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.roomId);
    const participantId = Number(req.params.participantId);

    const room = await chatService.removeParticipantFromRoom(roomId, participantId);

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.UPDATE,
      entityType: 'chat_room',
      entityId: room.id,
      details: `Removed participant (ID: ${participantId}) from chat room`,
    });

    // Create notification for removed participant
    try {
      await notificationService.createNotification({
        type: NotificationType.CHAT,
        content: `You have been removed from the chat room "${room.name}"`,
        recipientId: participantId,
        senderId: req.user.id,
        entityType: 'chat_room',
        entityId: room.id,
      });
    } catch (error) {
      console.error('Failed to create notification for removing participant:', error);
    }

    res.json(successResponse(room, 'Participant removed from chat room successfully'));
  });

  addModerator = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.id);
    const { userId } = req.body;
    const room = await chatService.addModerator(roomId, userId, req.user.id);

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.UPDATE,
      entityType: 'chat_room',
      entityId: room.id,
      details: `Added moderator (ID: ${userId}) to chat room`,
    });

    // Create notification for new moderator
    try {
      await notificationService.createNotification({
        type: NotificationType.CHAT,
        content: `You have been promoted to moderator in the chat room "${room.name}"`,
        recipientId: userId,
        senderId: req.user.id,
        entityType: 'chat_room',
        entityId: room.id,
      });
    } catch (error) {
      console.error('Failed to create notification for adding moderator:', error);
    }

    res.json(successResponse(room, 'Moderator added to chat room successfully'));
  });

  removeModerator = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.id);
    const userId = Number(req.params.userId);
    const room = await chatService.removeModerator(roomId, userId, req.user.id);

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.UPDATE,
      entityType: 'chat_room',
      entityId: room.id,
      details: `Removed moderator (ID: ${userId}) from chat room`,
    });

    // Create notification for removed moderator
    try {
      await notificationService.createNotification({
        type: NotificationType.CHAT,
        content: `You have been demoted from moderator in the chat room "${room.name}"`,
        recipientId: userId,
        senderId: req.user.id,
        entityType: 'chat_room',
        entityId: room.id,
      });
    } catch (error) {
      console.error('Failed to create notification for removing moderator:', error);
    }

    res.json(successResponse(room, 'Moderator removed from chat room successfully'));
  });

  muteRoom = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.id);
    const room = await chatService.muteRoom(roomId, req.user.id);

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.UPDATE,
      entityType: 'chat_room',
      entityId: room.id,
      details: `Muted chat room`,
    });

    res.json(successResponse(room, 'Chat room muted successfully'));
  });

  unmuteRoom = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.id);
    const room = await chatService.unmuteRoom(roomId, req.user.id);

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.UPDATE,
      entityType: 'chat_room',
      entityId: room.id,
      details: `Unmuted chat room`,
    });

    res.json(successResponse(room, 'Chat room unmuted successfully'));
  });

  updateRoomSettings = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.id);
    const room = await chatService.updateRoomSettings(roomId, req.body, req.user.id);

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.UPDATE,
      entityType: 'chat_room',
      entityId: room.id,
      details: `Updated chat room settings`,
    });

    res.json(successResponse(room, 'Chat room settings updated successfully'));
  });

  uploadAttachment = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.roomId);
    const attachment = await chatService.uploadAttachment(roomId, req.user.id, req.file);

    res
      .status(httpStatus.CREATED)
      .json(successResponse(attachment, 'Attachment uploaded successfully'));
  });

  getRoomAttachments = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.roomId);
    const { limit, page } = req.query;
    const attachments = await chatService.getRoomAttachments(roomId, {
      limit: limit ? Number(limit) : 20,
      page: page ? Number(page) : 1,
    });

    res.json(successResponse(attachments, 'Room attachments retrieved successfully'));
  });

  deleteAttachment = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.roomId);
    const messageId = Number(req.params.messageId);

    await chatService.deleteAttachment(roomId, messageId, req.user.id);

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.DELETE,
      entityType: 'chat_attachment',
      entityId: messageId,
      details: `Deleted attachment from chat room ${roomId}`,
    });

    res
      .status(httpStatus.NO_CONTENT)
      .json(successResponse(null, 'Attachment deleted successfully'));
  });

  reportMessage = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const messageId = Number(req.params.messageId);
    const { reason, details } = req.body;
    const report = await chatService.reportMessage(messageId, req.user.id, { reason, details });

    await auditService.logAction({
      userId: req.user.id,
      action: AuditActionType.CREATE,
      entityType: 'message_report',
      entityId: report.id,
      details: `Reported message for reason: ${reason}`,
    });

    res.status(httpStatus.CREATED).json(successResponse(report, 'Message reported successfully'));
  });

  getChatAnalytics = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const { period } = req.query;
    const analytics = await chatService.getChatAnalytics(req.user.id, period as string);

    res.json(successResponse(analytics, 'Chat analytics retrieved successfully'));
  });

  markMessagesAsRead = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const roomId = Number(req.params.roomId);
    const count = await chatService.markMessagesAsRead(req.user.id, roomId);
    res.json(successResponse({ markedAsRead: count }, 'Messages marked as read successfully'));
  });

  getUnreadMessageCount = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const count = await chatService.getUnreadMessageCount(req.user.id);
    res.json(
      successResponse({ unreadCount: count }, 'Unread message count retrieved successfully'),
    );
  });

  getNotifications = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const { limit, page, unreadOnly } = req.query;
    const notifications = await chatService.getNotifications(req.user.id, {
      limit: limit ? Number(limit) : 20,
      page: page ? Number(page) : 1,
      unreadOnly: unreadOnly === 'true',
    });

    res.json(successResponse(notifications, 'Notifications retrieved successfully'));
  });

  markNotificationAsRead = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const notificationId = Number(req.params.id);
    await chatService.markNotificationAsRead(notificationId, req.user.id);

    res
      .status(httpStatus.NO_CONTENT)
      .json(successResponse(null, 'Notification marked as read successfully'));
  });

  deleteNotification = typedCatchAsync<AuthenticatedRequest>(async (req, res) => {
    const notificationId = Number(req.params.id);
    await chatService.deleteNotification(notificationId, req.user.id);

    res
      .status(httpStatus.NO_CONTENT)
      .json(successResponse(null, 'Notification deleted successfully'));
  });
}

export default new ChatController();
