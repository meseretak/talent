// Referral routes
import express from 'express';
import { controllers } from '../../controllers/v1';
import validate from '../../middlewares/validate';
import { referralValidation } from '../../validations';

const router = express.Router();

// Basic referral operations
router.post(
  '/create',
  validate(referralValidation.createReferral),
  controllers.referral.createReferral,
);
router.get(
  '/users/:userId/referral-stats',
  validate(referralValidation.getReferralStats),
  controllers.referral.getReferralStats,
);
router.post(
  '/users/:userId/generate-link',
  validate(referralValidation.generateReferralLink),
  controllers.referral.generateReferralLink,
);

// Referral tracking and completion
router.post(
  '/track-click/:referralCode',
  validate(referralValidation.trackReferralClick),
  controllers.referral.trackReferralClick,
);
router.post(
  '/complete/:referralLink',
  validate(referralValidation.completeReferral),
  controllers.referral.completeReferral,
);

// Settings and analytics
router.get(
  '/settings',
  validate(referralValidation.getReferralSettings),
  controllers.referral.getReferralSettings,
);
router.put(
  '/settings',
  validate(referralValidation.updateReferralSettings),
  controllers.referral.updateReferralSettings,
);
router.get(
  '/analytics/:referralId',
  validate(referralValidation.getReferralAnalytics),
  controllers.referral.getReferralAnalytics,
);

// Enhanced referral operations
router.post(
  '/process-reward/:referralId',
  validate(referralValidation.processReferralReward),
  controllers.referral.processReferralReward,
);
router.get(
  '/fraud-score/:referralId',
  validate(referralValidation.getReferralFraudScore),
  controllers.referral.getReferralFraudScore,
);
router.get('/clicks/:referralId', controllers.referral.getReferralClicks);
router.get('/performance/:userId', controllers.referral.getReferralPerformance);

export default router;
