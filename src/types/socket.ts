import { Role } from '../generated/prisma';

export interface SocketUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  content: string;
  createdAt: Date;
  metadata?: any;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: Date;
}

export enum SocketEvents {
  // Chat events
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  SEND_MESSAGE = 'send_message',
  RECEIVE_MESSAGE = 'receive_message',
  MESSAGE_SENT = 'message_sent',
  MESSAGE_DELIVERED = 'message_delivered',
  MESSAGE_READ = 'message_read',
  MESSAGE_DELIVERY_CONFIRMATION = 'message_delivery_confirmation',
  MESSAGE_READ_CONFIRMATION = 'message_read_confirmation',
  TYPING = 'typing',
  STOP_TYPING = 'stop_typing',

  // Notification events
  NEW_NOTIFICATION = 'new_notification',
  READ_NOTIFICATION = 'read_notification',
  READ_NOTIFICATIONS = 'read_notifications',
  NOTIFICATION_DELIVERED = 'notification_delivered',
  NOTIFICATION_CLICKED = 'notification_clicked',
  NOTIFICATION_ACTION = 'notification_action',

  // Status events
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  RECONNECT = 'reconnect',

  // Error events
  ERROR = 'error',
}

export interface MessageStatusUpdate {
  messageId: string;
  delivered: boolean;
  read: boolean;
  deliveredAt?: Date;
  readAt?: Date;
  timestamp?: Date;
  readerId?: number;
}

export interface MessageWithStatus extends ChatMessage {
  status: {
    delivered: boolean;
    read: boolean;
  };
  sender: {
    id: number;
    firstName: string | null;
    lastName: string | null;
  };
}
