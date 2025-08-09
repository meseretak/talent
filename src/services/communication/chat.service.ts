import {
  ChatMessage,
  ChatMessageCreateInput,
  ChatRoom,
  ChatRoomCreateInput,
} from '../../types/chat';

import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
import prisma from '../../client';
import { MessageWithStatus } from '../../types/socket';
import ApiError from '../../utils/ApiError';
import { getUploadUrl } from '../../utils/urlUtils';

const mapMessageToChatMessage = (msg: any): ChatMessage => {
  // Handle attachment URLs in metadata
  let metadata = msg.metadata;
  if (metadata && msg.messageType === 'file') {
    const attachmentUrl = metadata.attachmentUrl;
    if (attachmentUrl && !attachmentUrl.startsWith('http')) {
      // If it's a relative path, generate the full URL
      if (attachmentUrl.startsWith('uploads/') || attachmentUrl.startsWith('/uploads/')) {
        const cleanFileName = attachmentUrl.replace(/^uploads\//, '').replace(/^\//, '');
        metadata = {
          ...metadata,
          attachmentUrl: getUploadUrl(cleanFileName),
        };
      } else if (metadata.fileName) {
        metadata = {
          ...metadata,
          attachmentUrl: getUploadUrl(metadata.fileName),
        };
      }
    }
  }

  return {
    id: msg.id,
    roomId: msg.roomId,
    senderId: msg.senderId,
    recipientId: msg.recipientId || undefined,
    message: msg.message,
    messageType: msg.messageType,
    metadata,
    sentAt: msg.sentAt,
    readAt: msg.readAt || undefined,
    status: msg.status,
    mentions: msg.mentions || [],
    reactions: Array.isArray(msg.reactions)
      ? msg.reactions.map((reaction: any) => ({
          userId: reaction.userId,
          emoji: reaction.emoji,
          createdAt: new Date(reaction.createdAt),
        }))
      : [],
    sender: msg.sender
      ? {
          id: msg.sender.id,
          firstName: msg.sender.firstName,
          lastName: msg.sender.lastName,
          email: msg.sender.email,
          avatar: msg.sender.avatar,
          role: msg.sender.role,
        }
      : undefined,
  };
};

const mapRoomToChatRoom = (room: any): ChatRoom =>
  ({
    id: room.id,
    name: room.name,
    description: room.description || undefined,
    projectId: room.projectId || undefined,
    isGroupChat: room.isGroupChat || false,
    groupChatId: room.groupChatId || null,
    chatType: room.chatType || 'GROUP',
    admin: room.admin || null,
    adminId: room.adminId || null,
    moderators: room.moderators || [],
    mutedParticipants: room.mutedParticipants || [],
    isTyping: room.isTyping || {},
    metadata: room.metadata || {},
    settings: room.settings || {},
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    lastMessageAt: room.lastMessageAt,
    participants: room.participants || [],
    messages: room.messages?.map(mapMessageToChatMessage) || [],
  } as ChatRoom);

/**
 * Create a new chat room
 * @param {ChatRoomCreateInput} roomData - The chat room data
 * @returns {Promise<ChatRoom>}
 */
const createChatRoom = async (roomData: ChatRoomCreateInput): Promise<ChatRoom> => {
  const { name, description, projectId, metadata, settings, participantIds } = roomData;

  // Determine if this is a group chat based on number of participants
  const isGroupChat = participantIds.length > 2;
  const chatType = isGroupChat ? 'GROUP' : 'DIRECT';

  // Find admin user (user with admin role)
  const adminUser = await prisma.user.findFirst({
    where: {
      role: 'ADMIN',
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  });

  if (!adminUser) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'No admin user found in the system');
  }

  // Add admin to participants if not already included
  const allParticipantIds = [...new Set([...participantIds, adminUser.id])];

  const room = await prisma.chatRoom.create({
    data: {
      name,
      description,
      projectId: projectId || null,
      isGroupChat,
      groupChatId: isGroupChat ? null : null, // Will be set for group chats if needed
      chatType,
      adminId: adminUser.id,
      metadata: metadata || {},
      settings: settings || {},
      participants: {
        connect: allParticipantIds.map((id: number) => ({ id })),
      },
      moderators: {
        connect: [{ id: adminUser.id }], // Add admin as moderator
      },
    },
    include: {
      participants: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      moderators: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  return mapRoomToChatRoom(room as any);
};

/**
 * Get chat room by ID
 * @param {number} roomId - The ID of the chat room
 * @returns {Promise<ChatRoom>}
 */
const getChatRoomById = async (roomId: number): Promise<ChatRoom> => {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      participants: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      moderators: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!room) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Chat room not found');
  }

  return mapRoomToChatRoom(room as any);
};

/**
 * Update chat room
 * @param {number} roomId - The ID of the chat room
 * @param {Object} updateData - The update data
 * @param {number} userId - The ID of the user making the update
 * @returns {Promise<ChatRoom>}
 */
const updateChatRoom = async (
  roomId: number,
  updateData: any,
  userId: number,
): Promise<ChatRoom> => {
  // Verify user is a participant
  const room = await getChatRoomById(roomId);
  if (!room.participants.some((p) => p.id === userId)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not a participant of this chat room');
  }

  const updatedRoom = await prisma.chatRoom.update({
    where: { id: roomId },
    data: {
      name: updateData.name,
      description: updateData.description,
      settings: updateData.settings,
      metadata: updateData.metadata,
    },
    include: {
      participants: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      moderators: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  return mapRoomToChatRoom(updatedRoom as any);
};

/**
 * Delete chat room
 * @param {number} roomId - The ID of the chat room
 * @param {number} userId - The ID of the user
 * @returns {Promise<void>}
 */
const deleteChatRoom = async (roomId: number, userId: number): Promise<void> => {
  // Verify user is admin or creator
  const room = await getChatRoomById(roomId);
  if (room.adminId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only room admin can delete the room');
  }

  await prisma.chatRoom.delete({
    where: { id: roomId },
  });
};

/**
 * Leave chat room
 * @param {number} roomId - The ID of the chat room
 * @param {number} userId - The ID of the user
 * @returns {Promise<void>}
 */
const leaveChatRoom = async (roomId: number, userId: number): Promise<void> => {
  await prisma.chatRoom.update({
    where: { id: roomId },
    data: {
      participants: {
        disconnect: { id: userId },
      },
    },
  });
};

/**
 * Archive chat room
 * @param {number} roomId - The ID of the chat room
 * @param {number} userId - The ID of the user
 * @returns {Promise<ChatRoom>}
 */
const archiveChatRoom = async (roomId: number, userId: number): Promise<ChatRoom> => {
  const room = await getChatRoomById(roomId);
  if (!room.participants.some((p) => p.id === userId)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not a participant of this chat room');
  }

  const updatedRoom = await prisma.chatRoom.update({
    where: { id: roomId },
    data: {
      metadata: {
        ...room.metadata,
        archived: true,
        archivedBy: userId,
        archivedAt: new Date(),
      },
    },
    include: {
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      moderators: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      participants: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  return mapRoomToChatRoom(updatedRoom as any);
};

/**
 * Unarchive chat room
 * @param {number} roomId - The ID of the chat room
 * @param {number} userId - The ID of the user
 * @returns {Promise<ChatRoom>}
 */
const unarchiveChatRoom = async (roomId: number, userId: number): Promise<ChatRoom> => {
  const room = await getChatRoomById(roomId);
  if (!room.participants.some((p) => p.id === userId)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not a participant of this chat room');
  }

  const { archivedBy, archivedAt, archived, ...restMetadata } = room.metadata as any;

  const updatedRoom = await prisma.chatRoom.update({
    where: { id: roomId },
    data: {
      metadata: {
        ...restMetadata,
        archived: false,
        archivedBy: null,
        archivedAt: null,
      },
    },
    include: {
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      moderators: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      participants: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  return mapRoomToChatRoom(updatedRoom as any);
};

/**
 * Get archived chat rooms
 * @param {number} userId - The ID of the user
 * @returns {Promise<ChatRoom[]>}
 */
const getArchivedChatRooms = async (userId: number): Promise<ChatRoom[]> => {
  // TODO: Add pagination and the metadata filter
  const rooms = await prisma.chatRoom.findMany({
    where: {
      participants: { some: { id: userId } },
      metadata: {
        path: ['archived'],
        equals: true,
      },
    },
    include: {
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      moderators: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      participants: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  return rooms.map(mapRoomToChatRoom as any);
};

/**
 * Get user's chat rooms
 * @param {number} userId - The ID of the user
 * @returns {Promise<ChatRoom[]>}
 */
const getUserChatRooms = async (userId: number): Promise<ChatRoom[]> => {
  const rooms = await prisma.chatRoom.findMany({
    where: {
      participants: {
        some: { id: userId },
      },
    },
    include: {
      participants: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  return rooms.map(mapRoomToChatRoom as any);
};

/**
 * Search chat rooms
 * @param {number} userId - The ID of the user
 * @param {Object} options - Search options
 * @returns {Promise<ChatRoom[]>}
 */
const searchChatRooms = async (
  userId: number,
  options: { query: string; limit: number; page: number },
): Promise<ChatRoom[]> => {
  const { query, limit, page } = options;
  const skip = (page - 1) * limit;

  const rooms = await prisma.chatRoom.findMany({
    where: {
      participants: {
        some: { id: userId },
      },
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      participants: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
    skip,
    take: limit,
    orderBy: { lastMessageAt: 'desc' },
  });

  return rooms.map(mapRoomToChatRoom as any);
};

/**
 * Send a message in a chat room
 * @param {ChatMessageCreateInput} messageData - The message data
 * @returns {Promise<ChatMessage>}
 */
const sendMessage = async (messageData: ChatMessageCreateInput): Promise<ChatMessage> => {
  // Use a transaction to ensure both message creation and room update are atomic
  const message = await prisma.$transaction(async (tx) => {
    // Create the message
    const newMessage = await tx.chatMessage.create({
      data: {
        roomId: messageData.roomId,
        senderId: messageData.senderId,
        recipientId: messageData.recipientId,
        message: messageData.message,
        messageType: messageData.messageType || 'text',
        metadata: messageData.metadata || {},
        sentAt: messageData.sentAt || new Date(),
        status: messageData.status || 'sent',
        mentions: messageData.mentions || [],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Update the chat room's lastMessageAt timestamp
    await tx.chatRoom.update({
      where: { id: messageData.roomId },
      data: {
        lastMessageAt: newMessage.sentAt,
      },
    });

    return newMessage;
  });

  return mapMessageToChatMessage(message as any);
};

/**
 * Edit a message
 * @param {number} messageId - The ID of the message
 * @param {number} userId - The ID of the user
 * @param {string} content - The new content
 * @returns {Promise<ChatMessage>}
 */
const editMessage = async (
  messageId: number,
  userId: number,
  content: string,
): Promise<ChatMessage> => {
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          avatar: true,
        },
      },
    },
  });

  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }

  if (message.senderId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Can only edit your own messages');
  }

  const updatedMessage = await prisma.chatMessage.update({
    where: { id: messageId },
    data: {
      message: content,
      editedAt: new Date(),
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          avatar: true,
        },
      },
    },
  });

  return mapMessageToChatMessage(updatedMessage as any);
};

/**
 * Delete a message
 * @param {number} messageId - The ID of the message
 * @param {number} userId - The ID of the user
 * @returns {Promise<void>}
 */
const deleteMessage = async (messageId: number, userId: number): Promise<void> => {
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }

  if (message.senderId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Can only delete your own messages');
  }

  await prisma.chatMessage.delete({
    where: { id: messageId },
  });
};

/**
 * Add reaction to message
 * @param {number} messageId - The ID of the message
 * @param {number} userId - The ID of the user
 * @param {string} emoji - The emoji reaction
 * @returns {Promise<Object>}
 */
const addMessageReaction = async (
  messageId: number,
  userId: number,
  emoji: string,
): Promise<any> => {
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }

  const reactions = (message.reactions as any[]) || [];
  const existingReactionIndex = reactions.findIndex(
    (r) => r.userId === userId && r.emoji === emoji,
  );

  if (existingReactionIndex !== -1) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Reaction already exists');
  }

  reactions.push({ userId, emoji, createdAt: new Date() });

  await prisma.chatMessage.update({
    where: { id: messageId },
    data: {
      reactions,
    },
  });

  return { messageId, userId, emoji };
};

/**
 * Remove reaction from message
 * @param {number} messageId - The ID of the message
 * @param {number} userId - The ID of the user
 * @param {string} emoji - The emoji reaction
 * @returns {Promise<void>}
 */
const removeMessageReaction = async (
  messageId: number,
  userId: number,
  emoji: string,
): Promise<void> => {
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }

  const reactions = (message.reactions as any[]) || [];
  const reactionIndex = reactions.findIndex((r) => r.userId === userId && r.emoji === emoji);

  if (reactionIndex === -1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Reaction not found');
  }

  reactions.splice(reactionIndex, 1);

  await prisma.chatMessage.update({
    where: { id: messageId },
    data: {
      reactions,
    },
  });
};

/**
 * Reply to a message
 * @param {number} messageId - The ID of the message to reply to
 * @param {number} userId - The ID of the user
 * @param {string} content - The reply content
 * @returns {Promise<ChatMessage>}
 */
const replyToMessage = async (
  messageId: number,
  userId: number,
  content: string,
): Promise<ChatMessage> => {
  const originalMessage = await prisma.chatMessage.findUnique({
    where: { id: messageId },
  });

  if (!originalMessage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Original message not found');
  }

  const replyData = {
    roomId: originalMessage.roomId,
    senderId: userId,
    message: content,
    messageType: 'text',
    metadata: {
      replyTo: {
        messageId: originalMessage.id,
        senderId: originalMessage.senderId,
        message: originalMessage.message,
      },
    },
    sentAt: new Date(),
    status: 'sent',
  };

  return sendMessage(replyData);
};

/**
 * Forward a message to other rooms
 * @param {number} messageId - The ID of the message to forward
 * @param {number} userId - The ID of the user
 * @param {number[]} roomIds - Array of room IDs to forward to
 * @returns {Promise<ChatMessage[]>}
 */
const forwardMessage = async (
  messageId: number,
  userId: number,
  roomIds: number[],
): Promise<ChatMessage[]> => {
  const originalMessage = await prisma.chatMessage.findUnique({
    where: { id: messageId },
  });

  if (!originalMessage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Original message not found');
  }

  const forwardedMessages: ChatMessage[] = [];

  for (const roomId of roomIds) {
    const forwardData = {
      roomId,
      senderId: userId,
      message: originalMessage.message,
      messageType: originalMessage.messageType,
      metadata: {
        forwardedFrom: {
          messageId: originalMessage.id,
          roomId: originalMessage.roomId,
          senderId: originalMessage.senderId,
        },
      },
      sentAt: new Date(),
      status: 'sent',
    };

    const forwardedMessage = await sendMessage(forwardData);
    forwardedMessages.push(forwardedMessage);
  }

  return forwardedMessages;
};

/**
 * Get message replies
 * @param {number} messageId - The ID of the message
 * @returns {Promise<ChatMessage[]>}
 */
const getMessageReplies = async (messageId: number): Promise<ChatMessage[]> => {
  const replies = await prisma.chatMessage.findMany({
    where: {
      metadata: {
        path: ['replyTo', 'messageId'],
        equals: messageId,
      },
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          avatar: true,
        },
      },
    },
    orderBy: { sentAt: 'asc' },
  });

  return replies.map(mapMessageToChatMessage as any);
};

/**
 * Get room messages
 * @param {number} roomId - The ID of the room
 * @param {Object} options - Query options
 * @param {number} [options.limit] - Maximum number of messages to return
 * @param {Date} [options.before] - Get messages before this date
 * @param {Date} [options.after] - Get messages after this date
 * @returns {Promise<ChatMessage[]>}
 */
const getRoomMessages = async (
  roomId: number,
  options?: { limit?: number; before?: Date; after?: Date },
): Promise<ChatMessage[]> => {
  const { limit, before, after } = options || {};

  const where: any = { roomId };

  if (before) {
    where.sentAt = { ...(where.sentAt || {}), lt: before };
  }

  if (after) {
    where.sentAt = { ...(where.sentAt || {}), gt: after };
  }

  const messages = await prisma.chatMessage.findMany({
    where,
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          avatar: true,
        },
      },
    },
    orderBy: { sentAt: 'desc' },
    ...(limit ? { take: limit } : {}),
  });

  return messages.map(mapMessageToChatMessage as any);
};

/**
 * Search messages
 * @param {number} userId - The ID of the user
 * @param {Object} options - Search options
 * @returns {Promise<ChatMessage[]>}
 */
const searchMessages = async (
  userId: number,
  options: { query: string; roomId?: number; limit: number; page: number },
): Promise<ChatMessage[]> => {
  const { query, roomId, limit, page } = options;
  const skip = (page - 1) * limit;

  const where: any = {
    message: { contains: query, mode: 'insensitive' },
  };

  if (roomId) {
    where.roomId = roomId;
  } else {
    // Search only in rooms where user is a participant
    where.chatRoom = {
      participants: {
        some: { id: userId },
      },
    };
  }

  const messages = await prisma.chatMessage.findMany({
    where,
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          avatar: true,
        },
      },
      chatRoom: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: { sentAt: 'desc' },
  });

  return messages.map(mapMessageToChatMessage as any);
};

/**
 * Mark messages as read
 * @param {number} userId - The ID of the user
 * @param {number} roomId - The ID of the room
 * @returns {Promise<number>}
 */
const markMessagesAsRead = async (userId: number, roomId: number): Promise<number> => {
  const result = await prisma.chatMessage.updateMany({
    where: {
      roomId,
      recipientId: userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
      status: 'read',
    },
  });

  return result.count;
};

/**
 * Get unread message count
 * @param {number} userId - The ID of the user
 * @returns {Promise<number>}
 */
const getUnreadMessageCount = async (userId: number): Promise<number> => {
  const count = await prisma.chatMessage.count({
    where: {
      recipientId: userId,
      readAt: null,
    },
  });

  return count;
};

/**
 * Update message status (delivered/read)
 * @param {number} messageId - The ID of the message
 * @param {Object} status - Status update object
 * @param {boolean} [status.delivered] - Whether the message was delivered
 * @param {boolean} [status.read] - Whether the message was read
 * @param {Date} [status.deliveredAt] - When the message was delivered
 * @param {Date} [status.readAt] - When the message was read
 */
const updateMessageStatus = async (
  messageId: number,
  status: { delivered?: boolean; read?: boolean; deliveredAt?: Date; readAt?: Date },
): Promise<void> => {
  const updateData: any = {};

  if (status.delivered !== undefined) {
    updateData.status = 'delivered';
  }
  if (status.read !== undefined) {
    updateData.status = 'read';
  }
  if (status.deliveredAt) {
    updateData.deliveredAt = status.deliveredAt;
  }
  if (status.readAt) {
    updateData.readAt = status.readAt;
  }

  await prisma.chatMessage.update({
    where: { id: messageId },
    data: updateData,
  });
};

/**
 * Get message status
 * @param {number} messageId - The ID of the message
 * @returns {Promise<Object>}
 */
const getMessageStatus = async (messageId: number): Promise<any> => {
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    select: {
      id: true,
      status: true,
      readAt: true,
      sentAt: true,
    },
  });

  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }

  return {
    messageId: message.id,
    status: message.status,
    readAt: message.readAt,
    sentAt: message.sentAt,
  };
};

/**
 * Add participants to a chat room
 * @param {number} roomId - The ID of the room
 * @param {number[]} participantIds - Array of user IDs to add
 * @returns {Promise<ChatRoom>}
 */
const addParticipantsToRoom = async (
  roomId: number,
  participantIds: number[],
): Promise<ChatRoom> => {
  const room = await prisma.chatRoom.update({
    where: { id: roomId },
    data: {
      participants: {
        connect: participantIds.map((id) => ({ id })),
      },
    },
    include: {
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      moderators: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      participants: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  return mapRoomToChatRoom(room as any);
};

/**
 * Remove a participant from a chat room
 * @param {number} roomId - The ID of the room
 * @param {number} participantId - ID of the user to remove
 * @returns {Promise<ChatRoom>}
 */
const removeParticipantFromRoom = async (
  roomId: number,
  participantId: number,
): Promise<ChatRoom> => {
  const room = await prisma.chatRoom.update({
    where: { id: roomId },
    data: {
      participants: {
        disconnect: { id: participantId },
      },
    },
    include: {
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      moderators: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      participants: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  return mapRoomToChatRoom(room as any);
};

/**
 * Add moderator to chat room
 * @param {number} roomId - The ID of the room
 * @param {number} userId - The ID of the user to make moderator
 * @param {number} adminId - The ID of the admin making the change
 * @returns {Promise<ChatRoom>}
 */
const addModerator = async (roomId: number, userId: number, adminId: number): Promise<ChatRoom> => {
  const room = await getChatRoomById(roomId);
  if (room.adminId !== adminId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only room admin can add moderators');
  }

  const updatedRoom = await prisma.chatRoom.update({
    where: { id: roomId },
    data: {
      moderators: {
        connect: { id: userId },
      },
    },
    include: {
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      moderators: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      participants: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  return mapRoomToChatRoom(updatedRoom as any);
};

/**
 * Remove moderator from chat room
 * @param {number} roomId - The ID of the room
 * @param {number} userId - The ID of the user to remove as moderator
 * @param {number} adminId - The ID of the admin making the change
 * @returns {Promise<ChatRoom>}
 */
const removeModerator = async (
  roomId: number,
  userId: number,
  adminId: number,
): Promise<ChatRoom> => {
  const room = await getChatRoomById(roomId);
  if (room.adminId !== adminId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only room admin can remove moderators');
  }

  const updatedRoom = await prisma.chatRoom.update({
    where: { id: roomId },
    data: {
      moderators: {
        disconnect: { id: userId },
      },
    },
    include: {
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      moderators: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      participants: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  return mapRoomToChatRoom(updatedRoom as any);
};

/**
 * Mute chat room
 * @param {number} roomId - The ID of the room
 * @param {number} userId - The ID of the user
 * @returns {Promise<ChatRoom>}
 */
const muteRoom = async (roomId: number, userId: number): Promise<ChatRoom> => {
  const room = await getChatRoomById(roomId);
  if (!room.participants.some((p) => p.id === userId)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not a participant of this chat room');
  }

  const mutedParticipants = room.mutedParticipants || [];
  if (!mutedParticipants.includes(userId)) {
    mutedParticipants.push(userId);
  }

  const updatedRoom = await prisma.chatRoom.update({
    where: { id: roomId },
    data: {
      mutedParticipants,
    },
    include: {
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      moderators: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      participants: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  return mapRoomToChatRoom(updatedRoom as any);
};

/**
 * Unmute chat room
 * @param {number} roomId - The ID of the room
 * @param {number} userId - The ID of the user
 * @returns {Promise<ChatRoom>}
 */
const unmuteRoom = async (roomId: number, userId: number): Promise<ChatRoom> => {
  const room = await getChatRoomById(roomId);
  if (!room.participants.some((p) => p.id === userId)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not a participant of this chat room');
  }

  const mutedParticipants = room.mutedParticipants || [];
  const updatedMutedParticipants = mutedParticipants.filter((id) => id !== userId);

  const updatedRoom = await prisma.chatRoom.update({
    where: { id: roomId },
    data: {
      mutedParticipants: updatedMutedParticipants,
    },
    include: {
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      moderators: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      participants: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  return mapRoomToChatRoom(updatedRoom as any);
};

/**
 * Update room settings
 * @param {number} roomId - The ID of the room
 * @param {Object} settings - The new settings
 * @param {number} userId - The ID of the user
 * @returns {Promise<ChatRoom>}
 */
const updateRoomSettings = async (
  roomId: number,
  settings: any,
  userId: number,
): Promise<ChatRoom> => {
  const room = await getChatRoomById(roomId);
  if (room.adminId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only room admin can update settings');
  }

  const updatedRoom = await prisma.chatRoom.update({
    where: { id: roomId },
    data: {
      settings: {
        ...room.settings,
        ...settings,
      },
    },
    include: {
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      moderators: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      participants: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  return mapRoomToChatRoom(updatedRoom as any);
};

/**
 * Upload attachment to chat room
 * @param {number} roomId - The ID of the room
 * @param {number} userId - The ID of the user
 * @param {Object} file - The uploaded file
 * @returns {Promise<Object>}
 */
const uploadAttachment = async (roomId: number, userId: number, file: any): Promise<any> => {
  // Verify user is a participant
  const room = await getChatRoomById(roomId);
  if (!room.participants.some((p) => p.id === userId)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not a participant of this chat room');
  }

  // Check if file was uploaded
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
  }

  // Create a message with the attachment
  const message = await sendMessage({
    roomId,
    senderId: userId,
    message: `Uploaded: ${file.filename}`,
    messageType: 'file',
    metadata: {
      attachmentUrl: getUploadUrl(file.filename),
      fileName: file.filename,
      fileSize: file.size,
      mimeType: file.mimetype,
    },
    sentAt: new Date(),
    status: 'sent',
  });

  return {
    messageId: message.id,
    fileName: file.filename,
    fileSize: file.size,
    mimeType: file.mimetype,
    attachmentUrl: getUploadUrl(file.filename),
  };
};

/**
 * Get room attachments
 * @param {number} roomId - The ID of the room
 * @param {Object} options - Query options
 * @returns {Promise<Object[]>}
 */
const getRoomAttachments = async (
  roomId: number,
  options: { limit: number; page: number },
): Promise<any[]> => {
  const { limit, page } = options;
  const skip = (page - 1) * limit;

  const messages = await prisma.chatMessage.findMany({
    where: {
      roomId,
      messageType: 'file',
    },
    select: {
      id: true,
      message: true,
      metadata: true,
      sentAt: true,
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: { sentAt: 'desc' },
  });

  return messages.map((msg) => {
    const metadata = msg.metadata as any;
    const fileName = metadata?.fileName || 'Unknown file';
    const attachmentUrl = metadata?.attachmentUrl;

    // If attachmentUrl is already a full URL, use it; otherwise, generate one
    let fullAttachmentUrl = attachmentUrl;
    if (attachmentUrl && !attachmentUrl.startsWith('http')) {
      // If it's a relative path, generate the full URL
      if (attachmentUrl.startsWith('uploads/') || attachmentUrl.startsWith('/uploads/')) {
        const cleanFileName = attachmentUrl.replace(/^uploads\//, '').replace(/^\//, '');
        fullAttachmentUrl = getUploadUrl(cleanFileName);
      } else {
        fullAttachmentUrl = getUploadUrl(fileName);
      }
    }

    return {
      messageId: msg.id,
      fileName,
      fileSize: metadata?.fileSize,
      mimeType: metadata?.mimeType,
      attachmentUrl: fullAttachmentUrl,
      uploadedBy: msg.sender,
      uploadedAt: msg.sentAt,
    };
  });
};

/**
 * Delete attachment from chat room
 * @param {number} roomId - The ID of the room
 * @param {number} messageId - The ID of the message containing the attachment
 * @param {number} userId - The ID of the user deleting the attachment
 * @returns {Promise<void>}
 */
const deleteAttachment = async (
  roomId: number,
  messageId: number,
  userId: number,
): Promise<void> => {
  // Verify user is a participant of the room
  const room = await getChatRoomById(roomId);
  if (!room.participants.some((p) => p.id === userId)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not a participant of this chat room');
  }

  // Find the message with the attachment
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }

  if (message.roomId !== roomId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Message does not belong to this room');
  }

  if (message.messageType !== 'file') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Message does not contain an attachment');
  }

  // Check if user is the sender or has admin/moderator privileges
  const isSender = message.senderId === userId;
  const isAdmin = room.adminId === userId;
  const isModerator = room.moderators.some((m) => m.id === userId);

  if (!isSender && !isAdmin && !isModerator) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Only the sender, admin, or moderators can delete attachments',
    );
  }

  // Get file information from metadata
  const metadata = message.metadata as any;
  const fileName = metadata?.fileName;
  const filePath = metadata?.attachmentUrl;

  // Delete the physical file if it exists
  if (fileName) {
    const fileSystemPath = path.join(process.cwd(), 'uploads', fileName);

    try {
      if (fs.existsSync(fileSystemPath)) {
        fs.unlinkSync(fileSystemPath);
      }
    } catch (error) {
      // Log the error but don't fail the operation if file deletion fails
      console.error('Failed to delete physical file:', error);
    }
  }

  // Delete the message from the database
  await prisma.chatMessage.delete({
    where: { id: messageId },
  });
};

/**
 * Report a message
 * @param {number} messageId - The ID of the message
 * @param {number} userId - The ID of the user reporting
 * @param {Object} reportData - The report data
 * @returns {Promise<Object>}
 */
const reportMessage = async (
  messageId: number,
  userId: number,
  reportData: { reason: string; details?: string },
): Promise<any> => {
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }

  // Create a report record (you might want to create a separate table for this)
  const report = {
    id: Date.now(), // Simple ID generation for MVP
    messageId,
    reporterId: userId,
    reason: reportData.reason,
    details: reportData.details,
    createdAt: new Date(),
    status: 'pending',
  };

  return report;
};

/**
 * Get chat analytics
 * @param {number} userId - The ID of the user
 * @param {string} period - The time period
 * @returns {Promise<Object>}
 */
const getChatAnalytics = async (userId: number, period: string): Promise<any> => {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default to day
  }

  const [totalMessages, unreadMessages, activeRooms] = await Promise.all([
    prisma.chatMessage.count({
      where: {
        senderId: userId,
        sentAt: { gte: startDate },
      },
    }),
    prisma.chatMessage.count({
      where: {
        recipientId: userId,
        readAt: null,
      },
    }),
    prisma.chatRoom.count({
      where: {
        participants: {
          some: { id: userId },
        },
        lastMessageAt: { gte: startDate },
      },
    }),
  ]);

  return {
    period,
    totalMessages,
    unreadMessages,
    activeRooms,
    startDate,
    endDate: now,
  };
};

/**
 * Get notifications
 * @param {number} userId - The ID of the user
 * @param {Object} options - Query options
 * @returns {Promise<Object[]>}
 */
const getNotifications = async (
  userId: number,
  options: { limit: number; page: number; unreadOnly: boolean },
): Promise<any[]> => {
  const { limit, page, unreadOnly } = options;
  const skip = (page - 1) * limit;

  const where: any = {
    recipientId: userId,
  };

  if (unreadOnly) {
    where.readAt = null;
  }

  const notifications = await prisma.notification.findMany({
    where,
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  return notifications.map((notification) => ({
    id: notification.id,
    type: notification.type,
    content: notification.content,
    createdAt: notification.createdAt,
    readAt: notification.readAt,
    sender: notification.sender,
    entityType: notification.entityType,
    entityId: notification.entityId,
  }));
};

/**
 * Mark notification as read
 * @param {number} notificationId - The ID of the notification
 * @param {number} userId - The ID of the user
 * @returns {Promise<void>}
 */
const markNotificationAsRead = async (notificationId: number, userId: number): Promise<void> => {
  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      recipientId: userId,
    },
    data: {
      readAt: new Date(),
    },
  });
};

/**
 * Delete notification
 * @param {number} notificationId - The ID of the notification
 * @param {number} userId - The ID of the user
 * @returns {Promise<void>}
 */
const deleteNotification = async (notificationId: number, userId: number): Promise<void> => {
  await prisma.notification.deleteMany({
    where: {
      id: notificationId,
      recipientId: userId,
    },
  });
};

/**
 * Get undelivered messages for a user
 * @param {number} userId - The ID of the user
 * @returns {Promise<MessageWithStatus[]>} - Array of undelivered messages
 */
const getUndeliveredMessages = async (userId: number): Promise<MessageWithStatus[]> => {
  const messages = await prisma.chatMessage.findMany({
    where: {
      recipientId: userId,
      status: { not: 'read' },
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          avatar: true,
        },
      },
      chatRoom: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { sentAt: 'asc' },
  });

  return messages.map((msg) => ({
    id: msg.id,
    roomId: msg.roomId,
    senderId: msg.senderId,
    recipientId: msg.recipientId,
    content: msg.message, // Map message to content
    messageType: msg.messageType,
    metadata: msg.metadata || {},
    sentAt: msg.sentAt,
    createdAt: msg.sentAt, // Using sentAt as createdAt if not available
    editedAt: msg.editedAt,
    status: {
      delivered: msg.status === 'delivered' || msg.status === 'read',
      read: msg.status === 'read',
    },
    sender: {
      id: msg.sender.id,
      firstName: msg.sender.firstName,
      lastName: msg.sender.lastName,
      email: msg.sender.email,
      role: msg.sender.role,
    },
    chatRoom: {
      id: msg.chatRoom.id,
      name: msg.chatRoom.name,
    },
  }));
};

export default {
  createChatRoom,
  getChatRoomById,
  updateChatRoom,
  deleteChatRoom,
  leaveChatRoom,
  archiveChatRoom,
  unarchiveChatRoom,
  getArchivedChatRooms,
  getUserChatRooms,
  searchChatRooms,
  sendMessage,
  editMessage,
  deleteMessage,
  addMessageReaction,
  removeMessageReaction,
  replyToMessage,
  forwardMessage,
  getMessageReplies,
  getRoomMessages,
  searchMessages,
  updateMessageStatus,
  getMessageStatus,
  markMessagesAsRead,
  getUnreadMessageCount,
  addParticipantsToRoom,
  removeParticipantFromRoom,
  addModerator,
  removeModerator,
  muteRoom,
  unmuteRoom,
  updateRoomSettings,
  uploadAttachment,
  getRoomAttachments,
  deleteAttachment,
  reportMessage,
  getChatAnalytics,
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  getUndeliveredMessages,
};
