import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import passport from 'passport';
import prisma from '../../../client';
import config from '../../../config/config';
import { Role, User } from '../../../generated/prisma';
import { authService, emailService, freelancerService, userService } from '../../../services';
import securityService from '../../../services/security.service';
import auditService from '../../../services/user/audit.service';
import { errorResponse, successResponse } from '../../../utils/apiResponse';
import catchAsync from '../../../utils/catchAsync';
import exclude from '../../../utils/exclude';

const register = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);

  const hasLoggedInBefore = await auditService.hasLoggedInBefore(user.id);

  if (!hasLoggedInBefore) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;

    await auditService.createLoginAudit({
      userId: user.id,
      email: user.email,
      ip: ip || '',
      userAgent: req.headers['user-agent'],
      platform: req.headers['sec-ch-ua-platform']?.toString().replace(/"/g, ''),
      host: req.headers.host,
    });
  }

  const userWithoutPassword = exclude(user, ['password', 'createdAt', 'updatedAt']);

  req.login(userWithoutPassword, (err) => {
    if (err) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(errorResponse('Error logging in after registration'));
    }
    res
      .status(httpStatus.CREATED)
      .json(successResponse({ user: userWithoutPassword }, 'Registration successful'));
  });
});

const registerFreelancer = catchAsync(async (req: Request, res: Response) => {
  const userData = {
    ...req.body,
    role: Role.FREELANCER,
  };

  const user = await userService.createUser(userData);
  const userWithoutPassword = exclude(user, ['password', 'createdAt', 'updatedAt']);

  const freelancer = await freelancerService.registerProfile({
    ...req.body,
    userId: user.id,
  });

  req.login(userWithoutPassword, (err) => {
    if (err) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(errorResponse('Error logging in after registration'));
    }
    res.status(httpStatus.CREATED).json(
      successResponse(
        {
          user: userWithoutPassword,
          freelancer: freelancer,
        },
        'Freelancer registration successful',
      ),
    );
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('local', async (err: any, user: any, info: any) => {
      if (err) {
        return reject(err);
      }
      if (!user) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .json(errorResponse(info?.message || 'Invalid email or password'));
      }

      req.login(user, async (loginErr) => {
        if (loginErr) {
          return reject(loginErr);
        }

        //TODO: check if the ip address is ipv6 for later fix
        const ip =
          (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
        await auditService.createLoginAudit({
          userId: user.id,
          email: user.email,
          ip: ip || '',
          userAgent: req.headers['user-agent'],
          platform: req.headers['sec-ch-ua-platform']?.toString().replace(/"/g, ''),
          host: req.headers.host,
        });

        (req.session as any).user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        };
        await req.session.save();
        const userWithSecurity = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            middleName: true,
            role: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
            status: true,
            avatar: true,
            provider: true,
            providerId: true,
            security: true,
          },
        });
        return res
          .status(httpStatus.OK)
          .json(successResponse({ user: userWithSecurity }, 'Login successful'));
      });
    })(req, res);
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  // Try to get userId from session or req.user
  const userId =
    ((req.session as any) && (req.session as any).user && (req.session as any).user.id) ||
    (req.user && (req.user as any).id);
  if (userId) {
    try {
      await securityService.disableCodeVerification(userId); // This sets isCodeVerified to false
    } catch (e) {
      // Log error but proceed with logout
      console.error('Failed to update isCodeVerified on logout:', e);
    }
  }
  req.logout((err) => {
    if (err) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(errorResponse('Error during logout'));
    }

    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        return res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json(errorResponse('Failed to destroy session during logout'));
      }

      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: config.env === 'production',
      });

      return res.status(httpStatus.OK).json(successResponse(null, 'Logout successful'));
    });
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  res.json(successResponse(req.user, 'User profile retrieved'));
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const resetPasswordToken = await authService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.OK).json(successResponse(null, 'Password reset email sent'));
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await authService.resetPassword(req.query.token as string, req.body.password);
  res.status(httpStatus.OK).json(successResponse(null, 'Password reset successful'));
});

const sendVerificationEmail = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(httpStatus.BAD_REQUEST).json(errorResponse('Email is required'));
  }

  const otp = await authService.generateEmailVerificationOTP(email);

  await emailService.sendVerificationOTP(email, otp);

  res.status(httpStatus.OK).json(
    successResponse(
      {
        expiresIn: '5 minutes',
      },
      'Verification OTP sent successfully',
    ),
  );
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(httpStatus.BAD_REQUEST).json(errorResponse('Email and OTP are required'));
  }

  const verified = await authService.verifyEmailWithOTP(email, otp);

  if (verified) {
    await prisma.token.create({
      data: {
        token: Math.random().toString(36).substring(2),
        email: email,
        type: 'EMAIL_VERIFIED',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        blacklisted: false,
      },
    });
  }

  res
    .status(httpStatus.OK)
    .json(
      successResponse(
        { verified },
        verified ? 'Email verified successfully' : 'Email verification failed',
      ),
    );
});

const googleCallback = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as User;

  if (!user || !user.id || !user.email) {
    return res.status(httpStatus.UNAUTHORIZED).json(errorResponse('Authentication failed'));
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
  await auditService.createLoginAudit({
    userId: user.id,
    email: user.email,
    ip: ip || '',
    userAgent: req.headers['user-agent'] || '',
    platform: req.headers['sec-ch-ua-platform']?.toString().replace(/"/g, '') || '',
    host: req.headers.host || '',
  });

  (req.session as any).user = {
    id: user.id,
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    role: user.role,
  };

  await req.session.save();

  res.redirect(config.clientUrl || '/');
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = (req.user as User)?.id;
  const userSavedPassword = (req.user as User)?.password;
  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).send({
      message: 'User not authenticated',
    });
  }

  // Validate required fields
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: 'Current password, new password, and confirm password are required',
    });
  }

  // Check if new password matches confirm password
  if (newPassword !== confirmPassword) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: 'New password and confirm password do not match',
    });
  }

  // Validate new password strength (minimum 8 characters, at least one letter and one number)
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message:
        'New password must be at least 8 characters long and contain at least one letter and one number',
    });
  }

  // Check if new password is different from current password
  if (currentPassword === newPassword) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: 'New password must be different from current password',
    });
  }
  if (currentPassword === userSavedPassword) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: 'Invalid current password',
    });
  }

  try {
    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).send({
        message: 'User not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password || '');
    if (!isCurrentPasswordValid) {
      return res.status(httpStatus.BAD_REQUEST).send({
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    // Create audit log for password change
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
    await auditService.createLoginAudit({
      userId: user.id,
      email: user.email,
      ip: ip || '',
      userAgent: req.headers['user-agent'] || '',
      platform: req.headers['sec-ch-ua-platform']?.toString().replace(/"/g, '') || '',
      host: req.headers.host || '',
    });

    // Send password change notification email
    try {
      const subject = 'Password Changed Successfully';
      const text = `Dear ${
        user.firstName || 'User'
      },\n\nYour password has been successfully changed.\n\nIf you did not make this change, please contact support immediately.\n\nBest regards,\nThe Byfluence Team`;
      await emailService.sendEmail(user.email, subject, text);
    } catch (emailError) {
      console.error('Failed to send password change notification email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(httpStatus.OK).send({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: 'Failed to change password. Please try again.',
    });
  }
});

export default {
  register,
  registerFreelancer,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  googleCallback,
  changePassword,
};
