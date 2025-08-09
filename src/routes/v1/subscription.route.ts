// Subscription routes
import express from 'express';
import { controllers } from '../../controllers/v1';
import { subscriptionEvents } from '../../events/subscription.events';
import auth from '../../middlewares/auth';
import subscriptionEventHandler from '../../services/subscription/subscription-event-handler.service';
import { errorResponse, successResponse } from '../../utils/apiResponse';

const router = express.Router();

// Routes available to authenticated users
router.use(auth());
/**
 * Subscription Management
 * These endpoints handle subscription creation, retrieval, and cancellation
 */
router.get('/info', controllers.subscription.getSubscription);
router.post('/info', controllers.subscription.createSubscription);
router.delete('/subscriptions/:subscriptionId', controllers.subscription.cancelSubscription);

/**
 * Credit Monitoring - Global
 * These endpoints trigger checks for all subscriptions
 */
router.post('/check-credits', async (req, res) => {
  try {
    await subscriptionEventHandler.checkLowCredits();
    res.status(200).json(successResponse(null, 'Credit check initiated successfully'));
  } catch (error) {
    res.status(500).json(errorResponse('Failed to run credit check'));
  }
});

router.post('/check-expiry', async (req, res) => {
  try {
    await subscriptionEventHandler.checkExpiredPackages();
    res.status(200).json(successResponse(null, 'Expiry check initiated successfully'));
  } catch (error) {
    res.status(500).json(errorResponse('Failed to run expiry check'));
  }
});

/**
 * Credit Monitoring - Individual
 * These endpoints trigger checks for specific subscriptions
 */
router.post('/subscriptions/:subscriptionId/check-credits', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    await subscriptionEvents.onCreditsLow(subscriptionId);
    res.status(200).json(successResponse(null, 'Credit check initiated for subscription'));
  } catch (error) {
    res.status(500).json(errorResponse('Failed to run credit check for subscription'));
  }
});

router.post('/subscriptions/:subscriptionId/check-expiry', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    await subscriptionEvents.onPackageExpiry(subscriptionId);
    res.status(200).json(successResponse(null, 'Expiry check initiated for subscription'));
  } catch (error) {
    res.status(500).json(errorResponse('Failed to run expiry check for subscription'));
  }
});

/**
 * Credits Management
 * These endpoints provide information about credit usage and balance
 */
router.get('/subscriptions/:subscriptionId/credits', (req, res, next) => {
  // Forward to the credit balance endpoint
  req.url = `/v1/credit/${req.params.subscriptionId}/balance`;
  next('route');
});

export default router;
