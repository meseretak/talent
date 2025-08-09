import { Request, Response } from 'express';
import httpStatus from 'http-status';
import otpService from '../../../services/communication/otp.service';
import catchAsync from '../../../utils/catchAsync';

const generateOTP = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await otpService.generateAndSendOTP(email);
  res.status(httpStatus.OK).send({ message: 'OTP sent successfully', expiresIn: result.expiresIn });
});

const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  await otpService.verifyOTP(email, otp);
  res.status(httpStatus.OK).send({ message: 'OTP verified successfully' });
});

export default {
  generateOTP,
  verifyOTP,
};
