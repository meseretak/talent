import { Socket, Server as SocketServer } from 'socket.io';
import logger from '../../config/logger';
import { chatService } from '../../services';
import { MessageWithStatus, SocketEvents, SocketUser } from '../../types/socket';

// Track typing timeouts per user per room
const typingTimeouts = new Map<string, NodeJS.Timeout>();

// Track message status
interface MessageStatus {
  messageId: number; // Changed from string to number to match database
  delivered: boolean;
  read: boolean;
  recipients: number[];
}

// Track message statuses
const messageStatuses = new Map<number, MessageStatus>(); // Changed key type to number

// Extend the chat service interface
// Extend the chat service interface
declare module '../../services' {
  interface ChatService {
    updateMessageStatus(
      messageId: number,
      status: {
        delivered?: boolean;
        read?: boolean;
        deliveredAt?: Date;
        readAt?: Date;
      },
    ): Promise<void>;

    getUndeliveredMessages(userId: number): Promise<MessageWithStatus[]>;
    getUserChatRooms(userId: number): Promise<{ id: number }[]>;
  }
}

export function setupChatHandlers(io: SocketServer, socket: Socket, user: SocketUser): void {
  console.log('[DEBUG] setupChatHandlers called for user', user?.id);
  // Join a chat room
  socket.on(SocketEvents.JOIN_ROOM, async (roomId: number) => {
    try {
      // Verify user has access to this room
      const room = await chatService.getChatRoomById(roomId);

      if (!room.participants.some((p) => p.id === user.id)) {
        socket.emit(SocketEvents.ERROR, { message: 'Access denied to this chat room' });
        return;
      }

      // Join the room
      socket.join(`room:${roomId}`);
      logger.info(`User ${user.id} joined room ${roomId}`);

      // Notify other participants that user is online in this room
      socket.to(`room:${roomId}`).emit(SocketEvents.USER_ONLINE, {
        userId: user.id,
        roomId,
      });
    } catch (error) {
      logger.error(`Error joining room: ${error}`);
      socket.emit(SocketEvents.ERROR, { message: 'Failed to join chat room' });
    }
  });

  // Leave a chat room
  socket.on(SocketEvents.LEAVE_ROOM, (roomId: number) => {
    socket.leave(`room:${roomId}`);
    logger.info(`User ${user.id} left room ${roomId}`);

    // Notify other participants
    socket.to(`room:${roomId}`).emit(SocketEvents.USER_OFFLINE, {
      userId: user.id,
      roomId,
    });
  });

  // Send a message to a room
  socket.on(
    SocketEvents.SEND_MESSAGE,
    async (data: { roomId: number; content: string; attachmentUrl?: string }) => {
      try {
        logger.debug(`[SOCKET] Received send_message:`, data);

        // Validate input
        if (!data.content || data.content.trim().length === 0) {
          socket.emit(SocketEvents.ERROR, { message: 'Message content cannot be empty' });
          return;
        }

        // Get room participants and verify access
        const room = await chatService.getChatRoomById(data.roomId);
        const isParticipant = room.participants.some((p) => p.id === user.id);

        if (!isParticipant) {
          socket.emit(SocketEvents.ERROR, { message: 'Access denied to this chat room' });
          return;
        }

        const recipientIds = room.participants.filter((p) => p.id !== user.id).map((p) => p.id);

        // Save message to database with proper error handling
        let message;
        try {
          message = await chatService.sendMessage({
            roomId: data.roomId,
            senderId: user.id,
            message: data.content.trim(),
            metadata: data.attachmentUrl ? { attachmentUrl: data.attachmentUrl } : undefined,
            sentAt: new Date(),
            status: 'sent',
          });

          logger.info(
            `Message saved to database: ID ${message.id}, Room ${data.roomId}, Sender ${user.id}`,
          );
        } catch (dbError) {
          logger.error(`Database error saving message: ${dbError}`);
          socket.emit(SocketEvents.ERROR, { message: 'Failed to save message to database' });
          return;
        }

        // Create message status tracking
        const messageStatus: MessageStatus = {
          messageId: message.id,
          delivered: false,
          read: false,
          recipients: [...recipientIds],
        };
        messageStatuses.set(message.id, messageStatus);

        // Prepare message with status for broadcasting
        const messageWithStatus = {
          ...message,
          sender: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
          },
          status: {
            delivered: false,
            read: false,
          },
        };

        // Broadcast message to all users in the room
        socket.to(`room:${data.roomId}`).emit(SocketEvents.RECEIVE_MESSAGE, messageWithStatus);

        // Emit to sender with delivered status
        socket.emit(SocketEvents.MESSAGE_SENT, {
          ...messageWithStatus,
          status: { delivered: true, read: true },
        });

        logger.info(`Message sent successfully in room ${data.roomId} by user ${user.id}`);
      } catch (error) {
        logger.error(`Error sending message: ${error}`);
        socket.emit(SocketEvents.ERROR, { message: 'Failed to send message' });
      }
    },
  );

  // User is typing with timeout
  socket.on(SocketEvents.TYPING, (roomId: number) => {
    const typingKey = `${user.id}:${roomId}`;

    // Clear existing timeout if any
    if (typingTimeouts.has(typingKey)) {
      clearTimeout(typingTimeouts.get(typingKey));
    }

    // Notify room that user is typing
    socket.to(`room:${roomId}`).emit(SocketEvents.TYPING, {
      userId: user.id,
      roomId,
    });

    // Set timeout to automatically stop typing after 3 seconds of inactivity
    const timeoutId = setTimeout(() => {
      socket.to(`room:${roomId}`).emit(SocketEvents.STOP_TYPING, {
        userId: user.id,
        roomId,
      });
      typingTimeouts.delete(typingKey);
    }, 3000);

    typingTimeouts.set(typingKey, timeoutId);
  });

  // User stopped typing
  socket.on(SocketEvents.STOP_TYPING, (roomId: number) => {
    const typingKey = `${user.id}:${roomId}`;
    if (typingTimeouts.has(typingKey)) {
      clearTimeout(typingTimeouts.get(typingKey));
      typingTimeouts.delete(typingKey);
    }

    socket.to(`room:${roomId}`).emit(SocketEvents.STOP_TYPING, {
      userId: user.id,
      roomId,
    });
  });

  // Message delivered confirmation
  socket.on(SocketEvents.MESSAGE_DELIVERED, async (messageId: number) => {
    try {
      const status = messageStatuses.get(messageId);
      if (status && status.recipients.includes(user.id)) {
        // Remove user from recipients list
        status.recipients = status.recipients.filter((id) => id !== user.id);
        status.delivered = status.recipients.length === 0;

        // Update in database
        await chatService.updateMessageStatus(messageId, {
          delivered: status.delivered,
          deliveredAt: status.delivered ? new Date() : undefined,
        });

        // Notify sender if all recipients received the message
        if (status.delivered) {
          io.to(`user:${user.id}`).emit(SocketEvents.MESSAGE_DELIVERY_CONFIRMATION, {
            messageId,
            delivered: true,
            timestamp: new Date(),
          });
        }
      }
    } catch (error) {
      logger.error(`Error updating message delivery status: ${error}`);
    }
  });

  // Message read confirmation
  socket.on(SocketEvents.MESSAGE_READ, async (messageId: number) => {
    try {
      const status = messageStatuses.get(messageId);
      if (status) {
        status.read = true;

        // Update in database
        await chatService.updateMessageStatus(messageId, {
          read: true,
          readAt: new Date(),
        });

        // Notify sender
        io.to(`user:${user.id}`).emit(SocketEvents.MESSAGE_READ_CONFIRMATION, {
          messageId,
          read: true,
          timestamp: new Date(),
          readerId: user.id,
        });
      }
    } catch (error) {
      logger.error(`Error updating message read status: ${error}`);
    }
  });

  // Handle reconnection
  socket.on(SocketEvents.RECONNECT, async () => {
    try {
      // Resend any undelivered messages
      const undeliveredMessages = await chatService.getUndeliveredMessages(user.id);
      undeliveredMessages.forEach((msg: MessageWithStatus) => {
        socket.emit(SocketEvents.RECEIVE_MESSAGE, msg);
      });

      // Update online status in all rooms
      const userRooms = await chatService.getUserChatRooms(user.id);
      userRooms.forEach((room: { id: number }) => {
        const roomId = room.id;
        socket.join(`room:${roomId}`);
        socket.to(`room:${roomId}`).emit(SocketEvents.USER_ONLINE, {
          userId: user.id,
          roomId,
        });
      });
    } catch (error) {
      logger.error(`Error during reconnection: ${error}`);
    }
  });
}
