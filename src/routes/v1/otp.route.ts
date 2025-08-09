import express from 'express';
import otpController from '../../controllers/v1/communication/otp.controller';
import validate from '../../middlewares/validate';
import { otpValidation } from '../../validations';

const router = express.Router();

router.route('/generate').post(validate(otpValidation.generateOTP), otpController.generateOTP);

router.route('/verify').post(validate(otpValidation.verifyOTP), otpController.verifyOTP);

export default router;
