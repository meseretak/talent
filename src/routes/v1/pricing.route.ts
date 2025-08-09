import express from 'express';
import { PricingController } from '../../controllers/v1/subscription/pricing.controller';

const router = express.Router();

// Get all plan information or specific plan information
router.get('/plan-information', PricingController.getPlanInformation);
router.get('/plan-information/:planId', PricingController.getPlanInformation);

// Get all comparisons
router.get('/comparisons', PricingController.getComparisons);

// Get specific comparison table
router.get('/comparisons/:comparisonId', PricingController.getComparisonTable);

// Create new plan information
router.post('/plan-information', PricingController.createPlanInformation);

// Create new comparison
router.post('/comparisons', PricingController.createComparison);

export default router;
