import { Router } from 'express';
import { createVersionedRouter } from '../config/version.config';
import healthRoutes from './health.route';
import v1Routes from './v1';
import webhookRoutes from './v1/webhook.routes';
import v2Routes from './v2';

const router = Router();

router.use('/v1/webhook', webhookRoutes);

// Unversioned routes
router.use('/v1/health', healthRoutes);

// API version routes
router.use('/v1', v1Routes);
router.use('/v2', v2Routes);

// Header-based versioning
const versionedRoutes = createVersionedRouter({
  v1: v1Routes,
  v2: v2Routes,
});

router.use('/', versionedRoutes);

// Add a catch-all 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    code: 404,
    message: 'Route not found',
  });
});

export default router;
