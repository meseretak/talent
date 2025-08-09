import httpStatus from 'http-status';
import prisma from '../../client';
import logger from '../../config/logger';
import { GuestSchedule, Prisma } from '../../generated/prisma';
import ApiError from '../../utils/ApiError';

/**
 * Create a guest schedule
 * @param {Object} scheduleData
 * @returns {Promise<GuestSchedule>}
 */
export const createGuestSchedule = async (scheduleData: {
  email?: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  phoneNumber?: string;
  currentEditingSolution?: string;
  frustrations: string[];
  monthlyPlanPreference?: string;
  notes?: string;
  scheduledDate?: Date;
  duration?: number;
  timeZone?: string;
  country?: string;

  meetingType?: string;
  meetingLink?: string;
}): Promise<GuestSchedule> => {
  try {
    logger.debug('Attempting to create guest schedule', { data: scheduleData });

    const schedule = await prisma.guestSchedule.create({
      data: {
        email: scheduleData.email,
        firstName: scheduleData.firstName,
        lastName: scheduleData.lastName,
        companyName: scheduleData.companyName,
        phoneNumber: scheduleData.phoneNumber,
        currentEditingSolution: scheduleData.currentEditingSolution,
        frustrations: scheduleData.frustrations,
        monthlyPlanPreference: scheduleData.monthlyPlanPreference,
        notes: scheduleData.notes,
        scheduledDate: scheduleData.scheduledDate,
        duration: scheduleData.duration,
        timeZone: scheduleData.timeZone,
        country: scheduleData.country,
        meetingType: scheduleData.meetingType,
        meetingLink: scheduleData.meetingLink,
        status: 'pending',
        isActive: true,
        reminderSent: false,
      },
    });

    logger.debug('Guest schedule created in database', { scheduleId: schedule.id });
    return schedule;
  } catch (error: any) {
    logger.error('Database error while creating guest schedule', {
      error: error.message,
      code: error.code,
      data: scheduleData,
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create schedule in database');
    }
    throw error;
  }
};

/**
 * Get guest schedule by id
 * @param {string} id
 * @returns {Promise<GuestSchedule>}
 */
export const getGuestScheduleById = async (id: string): Promise<GuestSchedule | null> => {
  return prisma.guestSchedule.findUnique({
    where: { id },
  });
};

/**
 * Get guest schedules by email
 * @param {string} email
 * @returns {Promise<GuestSchedule[]>}
 */
export const getGuestSchedulesByEmail = async (email: string): Promise<GuestSchedule[]> => {
  return prisma.guestSchedule.findMany({
    where: { email },
  });
};

/**
 * Update guest schedule by id
 * @param {string} id
 * @param {Object} updateData
 * @returns {Promise<GuestSchedule>}
 */
export const updateGuestSchedule = async (
  id: string,
  updateData: Prisma.GuestScheduleUpdateInput,
): Promise<GuestSchedule> => {
  const schedule = await getGuestScheduleById(id);
  if (!schedule) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Schedule not found');
  }

  return prisma.guestSchedule.update({
    where: { id },
    data: updateData,
  });
};

/**
 * Cancel guest schedule
 * @param {string} id
 * @returns {Promise<GuestSchedule>}
 */
export const cancelGuestSchedule = async (id: string): Promise<GuestSchedule> => {
  const schedule = await getGuestScheduleById(id);
  if (!schedule) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Schedule not found');
  }

  return prisma.guestSchedule.update({
    where: { id },
    data: {
      status: 'canceled',
      canceledAt: new Date(),
      isActive: false,
    },
  });
};

/**
 * Delete guest schedule
 * @param {string} id
 * @returns {Promise<GuestSchedule>}
 */
export const deleteGuestSchedule = async (id: string): Promise<GuestSchedule> => {
  const schedule = await getGuestScheduleById(id);
  if (!schedule) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Schedule not found');
  }

  return prisma.guestSchedule.delete({
    where: { id },
  });
};

/**
 * Get all upcoming schedules
 * @returns {Promise<GuestSchedule[]>}
 */
export const getUpcomingSchedules = async (): Promise<GuestSchedule[]> => {
  return prisma.guestSchedule.findMany({
    where: {
      scheduledDate: {
        gte: new Date(),
      },
      status: 'pending',
      isActive: true,
    },
    orderBy: {
      scheduledDate: 'asc',
    },
  });
};

/**
 * Confirm guest schedule
 * @param {string} id
 * @returns {Promise<GuestSchedule>}
 */
export const confirmGuestSchedule = async (id: string): Promise<GuestSchedule> => {
  const schedule = await getGuestScheduleById(id);
  if (!schedule) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Schedule not found');
  }

  return prisma.guestSchedule.update({
    where: { id },
    data: {
      status: 'confirmed',
    },
  });
};

/**
 * Mark schedule as completed
 * @param {string} id
 * @returns {Promise<GuestSchedule>}
 */
export const completeGuestSchedule = async (id: string): Promise<GuestSchedule> => {
  const schedule = await getGuestScheduleById(id);
  if (!schedule) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Schedule not found');
  }

  return prisma.guestSchedule.update({
    where: { id },
    data: {
      status: 'completed',
    },
  });
};

/**
 * Update reminder status
 * @param {string} id
 * @returns {Promise<GuestSchedule>}
 */
export const updateReminderStatus = async (id: string): Promise<GuestSchedule> => {
  const schedule = await getGuestScheduleById(id);
  if (!schedule) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Schedule not found');
  }

  return prisma.guestSchedule.update({
    where: { id },
    data: {
      reminderSent: true,
    },
  });
};
