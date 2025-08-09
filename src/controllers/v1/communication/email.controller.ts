import { Request, Response } from 'express';
import httpStatus from 'http-status';
import emailService from '../../../services/communication/email.service';
import catchAsync from '../../../utils/catchAsync';

const sendVerificationEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, token } = req.body;
  await emailService.sendVerificationEmail(email, token);
  res.status(httpStatus.OK).send({ message: 'Verification email sent successfully' });
});

const sendResetPasswordEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, token } = req.body;
  await emailService.sendResetPasswordEmail(email, token);
  res.status(httpStatus.OK).send({ message: 'Reset password email sent successfully' });
});

const sendWelcomeEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, name } = req.body;
  await emailService.sendWelcomeEmail(email, name);
  res.status(httpStatus.OK).send({ message: 'Welcome email sent successfully' });
});

const sendProjectAssignment = catchAsync(async (req: Request, res: Response) => {
  const { email, projectName, role } = req.body;
  await emailService.sendProjectAssignmentEmail(email, projectName, role);
  res.status(httpStatus.OK).send({ message: 'Project assignment email sent successfully' });
});

const sendMeetingInvitation = catchAsync(async (req: Request, res: Response) => {
  const { email, meetingDetails } = req.body;
  await emailService.sendMeetingInvitation(email, meetingDetails);
  res.status(httpStatus.OK).send({ message: 'Meeting invitation sent successfully' });
});

const sendGuestScheduleConfirmation = catchAsync(async (req: Request, res: Response) => {
  const { email, scheduleDetails } = req.body;
  await emailService.sendGuestScheduleConfirmation(email, scheduleDetails);
  res.status(httpStatus.OK).send({ message: 'Schedule confirmation sent successfully' });
});

export default {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendWelcomeEmail,
  sendProjectAssignment,
  sendMeetingInvitation,
  sendGuestScheduleConfirmation,
};
