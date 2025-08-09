import { Role } from '../generated/prisma';

export interface ChatUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

export interface ChatMessageReaction {
  userId: number;
  emoji: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  recipientId?: number;
  message: string;
  messageType: string;
  metadata: any;
  sentAt: Date;
  readAt?: Date;
  status: string;
  mentions: number[];
  reactions?: ChatMessageReaction[];
  sender?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    avatar?: string;
  };
}

export interface ChatMessageCreateInput {
  roomId: number;
  senderId: number;
  recipientId?: number;
  message: string;
  messageType?: string;
  metadata?: any;
  sentAt?: Date;
  status?: string;
  mentions?: number[];
}

export interface ChatRoom {
  id: number;
  name: string;
  description?: string;
  projectId?: number;
  metadata: any;
  settings: any;
  createdAt: Date;
  isGroupChat: boolean;
  groupChatId?: number;
  chatType: string;
  admin?: ChatUser | null;
  adminId?: number | null;
  moderators: ChatUser[];
  mutedParticipants: number[];
  isTyping: any;
  updatedAt: Date | null;
  lastMessageAt: Date | null;
  participants: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
  }[];
  messages: ChatMessage[];
}

export interface ChatRoomCreateInput {
  name: string;
  description?: string;
  projectId?: number;
  metadata?: any;
  settings?: any;
  participantIds: number[];
}
