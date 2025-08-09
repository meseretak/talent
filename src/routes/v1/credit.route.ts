// Credit routes
import express from 'express';
import { controllers } from '../../controllers/v1';

const router = express.Router();
router.get('/subscriptions/:subscriptionId/credits', controllers.credit.getCreditBalance);
router.post('/calculate-cost', controllers.credit.calculateServiceCost);
router.post('/consume-credits', controllers.credit.consumeCredits);
export default router;
