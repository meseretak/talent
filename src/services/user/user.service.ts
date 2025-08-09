import httpStatus from 'http-status';
import prisma from '../../client';
import { Prisma, Role, User } from '../../generated/prisma';
import { OAuthProvider } from '../../types/auth';
import ApiError from '../../utils/ApiError';
import { encryptPassword } from '../../utils/encryption';

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
export const createUser = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  role?: Role;
  provider?: OAuthProvider;
  providerId?: string;
  isEmailVerified?: boolean;
  avatar?: string;
}): Promise<User> => {
  // Validate required fields
  if (!userData.email || typeof userData.email !== 'string') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email is required and must be a string');
  }

  if (!userData.password || typeof userData.password !== 'string') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password is required and must be a string');
  }

  if (!userData.firstName || typeof userData.firstName !== 'string') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'First name is required and must be a string');
  }

  if (!userData.lastName || typeof userData.lastName !== 'string') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Last name is required and must be a string');
  }

  // Use a transaction for all database operations
  return prisma.$transaction(async (tx) => {
    // Check if email exists within transaction
    const existingUser = await tx.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }

    // Create privacy
    const privacy = await tx.privacy.create({
      data: {
        analyticsSharing: true,
        personalizedAds: true,
        dataRetention: '1 year',
      },
    });

    // Encrypt password if provided
    const hashedPassword = userData.password ? await encryptPassword(userData.password) : '';

    // Create user
    const user = await tx.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        middleName: userData.middleName || '',
        role: userData.role || Role.CLIENT,
        provider: userData.provider,
        providerId: userData.providerId,
        isEmailVerified: userData.isEmailVerified || false,
        avatar: userData.avatar || '',
      },
    });

    // Create preferences
    const userPreferences = await tx.userPreferences.create({
      data: {
        userId: user.id,
        timezone: 'UTC',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12-hour',
        fontSize: 14,
        theme: 'light',
        layout: 'default',
        privacyId: privacy.id,
        color: '#ffffff',
      },
    });

    // Create notification preferences
    const notificationPreferences = await tx.notificationPreferences.create({
      data: {
        userId: user.id,
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        accountActivity: true,
        newFeatures: true,
        marketing: false,
        frequency: 'daily',
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      },
    });

    // Update user with preference IDs
    return tx.user.update({
      where: { id: user.id },
      data: {
        preferences: {
          connect: { id: userPreferences.id },
        },
        notificationPrefs: {
          connect: { id: notificationPreferences.id },
        },
      },
    });
  });
};

/**
 * Query for users
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async <Key extends keyof User>(
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
  },
  keys: Key[] = [
    'id',
    'email',
    'firstName',
    'lastName',
    'middleName',
    'role',
    'provider',
    'providerId',
    'isEmailVerified',
    'createdAt',
    'updatedAt',
  ] as Key[],
): Promise<Pick<User, Key>[]> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? 'desc';
  const users = await prisma.user.findMany({
    where: filter,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    skip: (page - 1) * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined,
  });
  return users as Pick<User, Key>[];
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<User, Key> | null>}
 */
const getUserById = async <Key extends keyof User>(
  id: number,
  keys: Key[] = [
    'id',
    'email',
    'firstName',
    'lastName',
    'middleName',
    'role',
    'provider',
    'providerId',
    'isEmailVerified',
    'createdAt',
    'updatedAt',
  ] as Key[],
): Promise<Pick<User, Key> | null> => {
  return prisma.user.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<User, Key> | null>;
};

/**
 * Get user by email
 * @param {string} email
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<User, Key> | null>}
 */
const getUserByEmail = async <Key extends keyof User>(
  email: string,
  keys: Key[] = [
    'id',
    'email',
    'firstName',
    'lastName',
    'middleName',
    'role',
    'provider',
    'providerId',
    'isEmailVerified',
    'createdAt',
    'updatedAt',
  ] as Key[],
): Promise<Pick<User, Key> | null> => {
  return prisma.user.findUnique({
    where: { email },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<User, Key> | null>;
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async <Key extends keyof User>(
  userId: number,
  updateBody: Prisma.UserUpdateInput,
  keys: Key[] = ['id', 'email', 'firstName', 'lastName', 'role', 'isEmailVerified'] as Key[],
): Promise<Pick<User, Key> | null> => {
  const user = await getUserById(userId, [
    'id',
    'email',
    'firstName',
    'lastName',
    'middleName',
    'role',
    'provider',
    'providerId',
    'isEmailVerified',
  ]);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await getUserByEmail(updateBody.email as string))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: updateBody,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  });
  return updatedUser as Pick<User, Key> | null;
};

/**
 * Update user profile information (avatar, firstName, lastName, middleName)
 * @param {number} userId
 * @param {Object} profileData
 * @returns {Promise<Omit<User, 'password'>>}
 */
const updateUserProfile = async (
  userId: number,
  profileData: {
    avatar?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
  },
): Promise<Omit<User, 'password'>> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(profileData.avatar !== undefined && { avatar: profileData.avatar }),
      ...(profileData.firstName !== undefined && { firstName: profileData.firstName }),
      ...(profileData.lastName !== undefined && { lastName: profileData.lastName }),
      ...(profileData.middleName !== undefined && { middleName: profileData.middleName }),
    },
    select: {
      id: true,
      email: true,

      firstName: true,
      lastName: true,
      middleName: true,
      role: true,
      isEmailVerified: true,
      security: true,
      avatar: true,
      provider: true,
      providerId: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId: number): Promise<User> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Use a transaction to delete user and related records
  return prisma.$transaction(async (tx) => {
    // Get full user with relations to ensure we have IDs
    const fullUser = await tx.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
        notificationPrefs: true,
      },
    });

    if (!fullUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Delete related records first
    if (fullUser.notificationPrefs) {
      await tx.notificationPreferences.delete({
        where: { id: fullUser.notificationPrefs.id },
      });
    }

    if (fullUser.preferences) {
      // Get privacy ID before deleting preferences
      const privacyId = fullUser.preferences.privacyId;

      await tx.userPreferences.delete({
        where: { id: fullUser.preferences.id },
      });

      // Delete privacy settings
      if (privacyId) {
        await tx.privacy.delete({
          where: { id: privacyId },
        });
      }
    }

    // Finally delete the user
    return tx.user.delete({ where: { id: userId } });
  });
};

export default {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  updateUserProfile,
  deleteUserById,
};
