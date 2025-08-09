import { Router } from 'express';
import { HealthController } from '../controllers/v1/health.controller';

const router = Router();

/**
 * @route   GET /health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', HealthController.check);

export default router;
