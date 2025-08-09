import * as cookie from 'cookie';
import { Server as SocketServer } from 'socket.io';
import logger from '../config/logger';
import { PrismaClient } from '../generated/prisma';
import { SocketUser } from '../types/socket';
import { setupChatHandlers } from './handlers/chat.handler';
import { setupNotificationHandlers } from './handlers/notification.handler';
// Map to store active connections
const connectedUsers = new Map<number, string>();

export function initializeSocketIO(io: SocketServer): void {
  // Use session middleware for socket.io
  // io.engine.use(sessionMiddleware);

  const prisma = new PrismaClient();
  io.use(async (socket, next) => {
    try {
      // 1. Parse cookies from the socket handshake headers
      const cookies = socket.handshake.headers.cookie;
      // console.log('[DEBUG] Raw cookies:', cookies);
      if (!cookies) {
        return next(new Error('No cookies found'));
      }
      const parsedCookies = cookie.parse(cookies);
      // console.log('[DEBUG] Parsed cookies:', parsedCookies);

      // 2. Get and decode the connect.sid
      let rawSid = parsedCookies['connect.sid'];
      // console.log('[DEBUG] Raw connect.sid:', rawSid);
      if (!rawSid) {
        return next(new Error('No session ID found in cookies'));
      }
      // URL decode (may be double-encoded)
      rawSid = decodeURIComponent(rawSid);
      // console.log('[DEBUG] connect.sid after 1st decode:', rawSid);
      rawSid = decodeURIComponent(rawSid);
      // console.log('[DEBUG] connect.sid after 2nd decode:', rawSid);

      // Remove 's:' prefix and signature
      const sidMatch = rawSid.match(/^s:([^.]+)\./);
      const sessionId = sidMatch ? sidMatch[1] : rawSid;
      // console.log('[DEBUG] Session ID:', sessionId);

      // 3. Fetch session from your session store (example for Prisma)
      const session = await prisma.session.findUnique({
        where: { sid: sessionId },
      });
      // console.log('[DEBUG] Prisma session:', session);

      if (!session || !session.data) {
        return next(new Error('Session not found'));
      }

      // 4. Parse session data (assuming it's JSON)
      const sessionData =
        typeof session.data === 'string' ? JSON.parse(session.data) : session.data;
      // console.log('[DEBUG] Session data:', sessionData);

      // 5. Get user ID from session data and fetch user
      const userId = sessionData.user?.id;
      // console.log('[DEBUG] User ID from session:', userId);
      if (!userId) {
        return next(new Error('No user in session'));
      }
      const user = await prisma.user.findUnique({ where: { id: userId } });
      //  console.log('[DEBUG] User from DB:', user);
      if (!user) {
        return next(new Error('User not found'));
      }

      // Attach user to socket
      (socket as any).user = user;
      next();
    } catch (error) {
      console.error('[DEBUG] Authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user as SocketUser;

    if (!user) {
      logger.error('Socket connection without user data');
      socket.disconnect();
      return;
    }

    logger.info(`User connected: ${user.id} (${user.email})`);

    // Store the connection
    connectedUsers.set(user.id, socket.id);

    // Join user to their personal room for direct messages
    socket.join(`user:${user.id}`);

    // Setup event handlers
    setupChatHandlers(io, socket, user);
    setupNotificationHandlers(io, socket, user);

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${user.id} (${user.email})`);
      connectedUsers.delete(user.id);
    });
  });

  logger.info('Socket.IO initialized');
}

// Utility function to check if a user is online
export function isUserOnline(userId: number): boolean {
  return connectedUsers.has(userId);
}

// Utility function to get a user's socket ID
export function getUserSocketId(userId: number): string | undefined {
  return connectedUsers.get(userId);
}

// Utility function to emit event to a specific user
export function emitToUser(io: SocketServer, userId: number, event: string, data: any): void {
  io.to(`user:${userId}`).emit(event, data);
}

// Utility function to emit event to multiple users
export function emitToUsers(io: SocketServer, userIds: number[], event: string, data: any): void {
  userIds.forEach((userId) => {
    emitToUser(io, userId, event, data);
  });
}
