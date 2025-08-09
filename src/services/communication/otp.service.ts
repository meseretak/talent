import httpStatus from 'http-status';
import { PrismaClient } from '../../generated/prisma';
import generateEmailHTML from '../../template/email';
import ApiError from '../../utils/ApiError';
import emailService from './email.service';

const prisma = new PrismaClient();

/**
 * Generate OTP and send via email
 */
const generateAndSendOTP = async (email: string): Promise<{ expiresIn: number }> => {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresIn = 10 * 60 * 1000; // 10 minutes in milliseconds

  // Save OTP to database without user association
  await prisma.token.create({
    data: {
      token: otp,
      type: 'OTP',
      expires: new Date(Date.now() + expiresIn),
      blacklisted: false,
      email: email, // Store email directly instead of user association
    },
  });

  // Send OTP via email
  await emailService.sendEmail(
    email,
    'Your OTP Code',
    `Your OTP code is: ${otp}`,
    generateEmailHTML('otp', {
      code: otp,
      expires: '10 minutes',
    }),
  );

  return { expiresIn };
};

/**
 * Verify OTP
 */
const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  const otpRecord = await prisma.token.findFirst({
    where: {
      token: otp,
      type: 'OTP',
      blacklisted: false,
      email: email, // Check email directly instead of through user relation
      expires: {
        gt: new Date(),
      },
    },
  });

  if (!otpRecord) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired OTP');
  }

  // Invalidate the OTP
  await prisma.token.update({
    where: { id: otpRecord.id },
    data: { blacklisted: true },
  });

  return true;
};

export default {
  generateAndSendOTP,
  verifyOTP,
};
