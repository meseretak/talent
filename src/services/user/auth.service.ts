import httpStatus from 'http-status';
import prisma from '../../client';
import { User } from '../../generated/prisma';
import { AuthTokensResponse } from '../../types/response';
import ApiError from '../../utils/ApiError';
import { encryptPassword, isPasswordMatch } from '../../utils/encryption';
import exclude from '../../utils/exclude';
import userService from './user.service';

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Omit<User, 'password'>>}
 */
const loginUserWithEmailAndPassword = async (
  email: string,
  password: string,
): Promise<
  Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'middleName' | 'role' | 'isEmailVerified'>
> => {
  const user = await userService.getUserByEmail(email, [
    'id',
    'email',
    'firstName',
    'lastName',
    'middleName',
    'password',
    'role',
    'isEmailVerified',
    'createdAt',
    'updatedAt',
  ]);

  if (!user || !(await isPasswordMatch(password, user.password as string))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  return exclude(user, ['password', 'createdAt', 'updatedAt']);
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise<void>}
 */
const logout = async (refreshToken: string): Promise<void> => {
  const refreshTokenData = await prisma.token.findFirst({
    where: {
      token: refreshToken,
      type: 'REFRESH',
      blacklisted: false,
    },
  });
  if (!refreshTokenData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await prisma.token.delete({ where: { id: refreshTokenData.id } });
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<AuthTokensResponse>}
 */
const refreshAuth = async (refreshToken: string): Promise<AuthTokensResponse> => {
  try {
    const refreshTokenData = await prisma.token.findFirst({
      where: {
        token: refreshToken,
        type: 'REFRESH',
        blacklisted: false,
      },
    });
    if (!refreshTokenData) {
      throw new Error();
    }
    const { userId } = refreshTokenData;
    await prisma.token.delete({ where: { id: refreshTokenData.id } });
    // Note: Token generation logic needs to be reimplemented
    throw new ApiError(httpStatus.NOT_IMPLEMENTED, 'Token refresh not implemented');
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
const resetPassword = async (resetPasswordToken: string, newPassword: string): Promise<void> => {
  try {
    const resetPasswordTokenData = await prisma.token.findFirst({
      where: {
        token: resetPasswordToken,
        type: 'RESET_PASSWORD',
        blacklisted: false,
      },
    });
    if (!resetPasswordTokenData) {
      throw new Error();
    }
    const user = await userService.getUserById(resetPasswordTokenData.userId!);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await prisma.token.deleteMany({ where: { userId: user.id, type: 'RESET_PASSWORD' } });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email: string): Promise<string> => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }

  // Generate a random token
  const token =
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // Save token to database
  await prisma.token.create({
    data: {
      token,
      userId: user.id,
      type: 'RESET_PASSWORD',
      expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      blacklisted: false,
    },
  });

  return token;
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise<void>}
 */
const verifyEmail = async (verifyEmailToken: string): Promise<void> => {
  try {
    const verifyEmailTokenData = await prisma.token.findFirst({
      where: {
        token: verifyEmailToken,
        type: 'VERIFY_EMAIL',
        blacklisted: false,
      },
    });
    if (!verifyEmailTokenData) {
      throw new Error();
    }
    await prisma.token.deleteMany({
      where: { userId: verifyEmailTokenData.userId, type: 'VERIFY_EMAIL' },
    });
    await userService.updateUserById(verifyEmailTokenData.userId!, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user: User): Promise<string> => {
  // Generate a random token
  const token =
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // Save token to database
  await prisma.token.create({
    data: {
      token,
      userId: user.id,
      type: 'VERIFY_EMAIL',
      expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      blacklisted: false,
    },
  });

  return token;
};

// const getAuthenticatedUser = async (user: User): Promise<User | null> => {
//   // Check if user exists in the session
//   if (user) {
//     if (user.role === 'FREELANCER') {
//       const freelancer = await prisma.freelancer.findUnique({
//         where: { userId: user.id },
//       });
//       return user;
//     }
//   }
//   return null;
// };

/**
 * Generate a 6-digit OTP code
 * @returns {string} 6-digit OTP
 */
const generateOTP = (): string => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate email verification OTP
 * @param {string} email - User's email
 * @returns {Promise<string>} The generated OTP
 */
const generateEmailVerificationOTP = async (email: string): Promise<string> => {
  // Generate a 6-digit OTP
  const otp = generateOTP();

  // Check if user exists
  const user = await userService.getUserByEmail(email);

  if (user) {
    // Delete any existing email verification tokens for this user
    await prisma.token.deleteMany({
      where: { userId: user.id, type: 'VERIFY_EMAIL' },
    });

    // Save OTP to database with 5-minute expiration
    await prisma.token.create({
      data: {
        token: otp,
        userId: user.id,
        type: 'VERIFY_EMAIL',
        expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        blacklisted: false,
      },
    });
  } else {
    // For new users, store the OTP with the email as a reference
    await prisma.token.create({
      data: {
        token: otp,
        email: email, // Store email for non-registered users
        type: 'VERIFY_EMAIL',
        expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        blacklisted: false,
      },
    });
  }

  return otp;
};

/**
 * Verify email with OTP
 * @param {string} email - User's email
 * @param {string} otp - The OTP to verify
 * @returns {Promise<boolean>}
 */
const verifyEmailWithOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    console.log('Attempting to verify email:', email, 'with OTP:', otp);
    // Check for token by email (for both registered and non-registered users)
    const verifyEmailTokenData = await prisma.token.findFirst({
      where: {
        token: otp,
        type: 'VERIFY_EMAIL',
        blacklisted: false,
        expires: {
          gt: new Date(), // Token must not be expired
        },
        OR: [
          { email: email },
          {
            user: {
              email: email,
            },
          },
        ],
      },
      include: {
        user: true,
      },
    });

    console.log('Token data found:', verifyEmailTokenData);

    if (!verifyEmailTokenData) {
      console.log('No valid token found for the given OTP');
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired OTP');
    }

    // If user exists, update their verification status
    if (verifyEmailTokenData.userId) {
      console.log('User found, updating verification status');
      // Delete all verification tokens for this user
      await prisma.token.deleteMany({
        where: { userId: verifyEmailTokenData.userId, type: 'VERIFY_EMAIL' },
      });

      // Update user's email verification status
      await userService.updateUserById(verifyEmailTokenData.userId, { isEmailVerified: true });
    } else {
      console.log('No user found, cleaning up token');
      // For non-registered users, just delete the token
      await prisma.token.delete({
        where: { id: verifyEmailTokenData.id },
      });
    }

    return true;
  } catch (error) {
    console.error('Verification error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

/**
 * Check if email is verified with OTP
 * @param {string} email - User's email
 * @returns {Promise<boolean>}
 */
const isEmailVerifiedWithOTP = async (email: string): Promise<boolean> => {
  // Check if there's a verified token for this email
  const verifiedToken = await prisma.token.findFirst({
    where: {
      email: email,
      type: 'EMAIL_VERIFIED',
      blacklisted: false,
    },
  });

  return !!verifiedToken;
};

export default {
  loginUserWithEmailAndPassword,
  isPasswordMatch,
  encryptPassword,
  logout,
  refreshAuth,
  resetPassword,
  generateResetPasswordToken,
  verifyEmail,
  generateVerifyEmailToken,
  // Add new functions to the export
  generateEmailVerificationOTP,
  verifyEmailWithOTP,
  isEmailVerifiedWithOTP,
};
