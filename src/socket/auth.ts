import prisma from '../client';
import { Session } from '../generated/prisma';
import { SocketUser } from '../types/socket';

export async function verifySocketToken(sessionId: string): Promise<SocketUser | null> {
  let session: Session | null = null;
  try {
    // Remove 's%3A' prefix and everything after the '.' if present
    const cleanSessionId = sessionId.replace(/^s%3A/, '').split('.')[0];

    session = (await prisma.session.findUnique({
      where: { sid: cleanSessionId },
      select: {
        expiresAt: true,
        data: true,
      },
    })) as Session | null;

    // Type guard to ensure session and user exist
    if (!session || session.expiresAt < new Date()) {
      console.log('Session not found or expired');
      return null;
    }

    // Parse the session data
    const sessionData = JSON.parse(session.data);
    console.log('Session data:', sessionData); // Debug log

    // Check if user data exists in session
    if (!sessionData?.user) {
      console.log('No user data in session');
      return null;
    }

    const { id, email, firstName, lastName, role } = sessionData.user;

    // Validate required fields
    if (!id || !email || !firstName || !lastName) {
      console.log('Missing required user fields');
      return null;
    }

    // Return the formatted user data
    return {
      id,
      email,
      firstName,
      lastName,
      role: role || 'user', // Default to 'user' if role is not specified
    };
  } catch (error) {
    console.error('Socket authentication error:', error);
    console.error('Session data that caused error:', session?.data);
    return null;
  }
}
