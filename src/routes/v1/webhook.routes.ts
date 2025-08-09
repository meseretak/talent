import express, { Router } from 'express';
import { handleWebhook } from '../../controllers/v1/subscription/payment.controller';

const router = Router();

/**
 * @route POST /api/v1/webhook
 * @desc Handle Stripe webhook events with raw body parsing
 * @access Public
 */
// Use raw body parsing for webhook to preserve signature verification
router.post('/', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
