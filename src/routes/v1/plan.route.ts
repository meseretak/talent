// Plan routes
import express from 'express';
import { controllers } from '../../controllers/v1';
import {
  createPlan,
  deletePlan,
  getPlan,
  getPlans,
  syncAllPlansWithStripe,
  syncPlanWithStripe,
  updatePlan,
} from '../../controllers/v1/subscription/plan.controller';

const router = express.Router();

// Public plan endpoints
router.get('/', controllers.plan.getAvailablePlans);
router.get('/pricing-page', controllers.plan.getPricingPage);
router.get('/:planId', controllers.plan.getPlanById);
router.get('/:planId/features', controllers.plan.getPlanFeatures);
router.get('/:planId/prices', controllers.plan.getPlanPrices);

// Admin plan management endpoints
router.post('/create', createPlan);
router.get('/all', getPlans);
router.get('/info/:id', getPlan);
router.put('/update/:id', updatePlan);
router.delete('/delete/:id', deletePlan);

// Stripe synchronization
router.post('/sync/:id', syncPlanWithStripe);
router.post('/sync-all', syncAllPlansWithStripe);

export default router;
