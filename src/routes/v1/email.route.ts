import express from 'express';
import emailController from '../../controllers/v1/communication/email.controller';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { emailValidation } from '../../validations';

const router = express.Router();

router
  .route('/verify')
  .post(auth(), validate(emailValidation.sendVerification), emailController.sendVerificationEmail);

router
  .route('/reset-password')
  .post(validate(emailValidation.sendResetPassword), emailController.sendResetPasswordEmail);

router
  .route('/welcome')
  .post(auth(), validate(emailValidation.sendWelcome), emailController.sendWelcomeEmail);

router
  .route('/project-assignment')
  .post(
    auth(),
    validate(emailValidation.sendProjectAssignment),
    emailController.sendProjectAssignment,
  );

router
  .route('/meeting-invitation')
  .post(
    auth(),
    validate(emailValidation.sendMeetingInvitation),
    emailController.sendMeetingInvitation,
  );

router
  .route('/schedule-confirmation')
  .post(
    validate(emailValidation.sendScheduleConfirmation),
    emailController.sendGuestScheduleConfirmation,
  );

export default router;
