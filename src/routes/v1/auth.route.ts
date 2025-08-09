import express from 'express';
import passport from 'passport';
import config from '../../config/config';
import authController from '../../controllers/v1/user/auth.controller';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import authValidation from '../../validations/auth.validation';

const router = express.Router();

// Local authentication routes
router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', authController.logout);
router.get('/me', auth(), authController.getMe);

// Google authentication routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { failureRedirect: '/login' })(req, res, (err: any) => {
      if (err) {
        console.error('Google authentication error:', err);
        return res.redirect(`${config.clientUrl}/auth/login?error=google_auth_failed`);
      }
      next();
    });
  },
  authController.googleCallback,
);

// Password management routes
router.post(
  '/forgot-password',
  validate(authValidation.forgotPassword),
  authController.forgotPassword,
);
router.post(
  '/reset-password',
  validate(authValidation.resetPassword),
  authController.resetPassword,
);

// Email verification routes - these should be accessible without authentication
router.post(
  '/send-verification-email',
  validate(authValidation.sendVerificationEmail),
  authController.sendVerificationEmail,
);

router.post(
  '/verify-email',
  validate(authValidation.verifyEmailWithOTP),
  authController.verifyEmail,
);

// Freelancer registration
router.post(
  '/register-freelancer',
  validate(authValidation.registerFreelancer),
  authController.registerFreelancer,
);
router.post(
  '/change-password',
  auth(),
  validate(authValidation.changePassword),
  authController.changePassword,
);
// Add this route to your existing auth routes
router.get('/google-status', (req, res) => {
  const isConfigured = !!(
    config.google?.clientId &&
    config.google?.clientSecret &&
    config.google?.callbackUrl
  );

  res.json({
    googleAuthConfigured: isConfigured,
    callbackUrl: config.google?.callbackUrl || 'Not configured',
    userIsAuthenticated: !!req.user,
  });
});

export default router;
