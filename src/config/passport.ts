import bcrypt from 'bcryptjs';
import { PassportStatic } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import prisma from '../client';
import { OAuthProvider } from '../types/auth';
import config from './config';
import logger from './logger';

// Local strategy for username/password login
const localVerify = async (email: string, password: string, done: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return done(null, false, { message: 'Incorrect email or password' });
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password as string);
    if (!isPasswordMatch) {
      return done(null, false, { message: 'Incorrect email or password' });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return done(null, userWithoutPassword);
  } catch (error) {
    return done(error);
  }
};

// Google OAuth strategy
const googleVerify = async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: profile.emails[0].value },
          {
            AND: [{ provider: OAuthProvider.GOOGLE }, { providerId: profile.id }],
          },
        ],
      },
    });

    if (existingUser) {
      // Update user's Google-specific fields if needed
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          provider: OAuthProvider.GOOGLE,
          providerId: profile.id,
          isEmailVerified: true,
        },
      });
      return done(null, updatedUser);
    }

    // Create new user if doesn't exist
    const newUser = await prisma.user.create({
      data: {
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        provider: OAuthProvider.GOOGLE,
        providerId: profile.id,
        isEmailVerified: true,
        avatar: profile.photos?.[0]?.value,
        role: 'CLIENT',
      },
    });

    return done(null, newUser);
  } catch (error) {
    return done(error);
  }
};

export const localStrategy = new LocalStrategy({ usernameField: 'email' }, localVerify);

// Check Google OAuth configuration
// Create a conditional strategy setup
let googleStrategy: GoogleStrategy | null = null;

if (config.google?.clientId && config.google?.clientSecret && config.google?.callbackUrl) {
  googleStrategy = new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
      scope: ['profile', 'email'],
    },
    googleVerify,
  );
} else {
  logger.warn(
    'Google OAuth configuration is missing or incomplete. Google authentication will be disabled.',
  );
}

// Configure passport for session serialization/deserialization
export const configurePassport = (passport: PassportStatic) => {
  // Use strategies
  passport.use(localStrategy);

  // Only use Google strategy if configured
  if (googleStrategy) {
    passport.use(googleStrategy);
  }

  // Session serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Session deserialization
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          middleName: true,
          role: true,
        },
        where: { id: parseInt(id) },
      });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
