// Discount routes
import express from 'express';
import { controllers } from '../../controllers/v1';

const router = express.Router();
router.post('/discounts', controllers.discount.createDiscount);
router.post('/apply-discount', controllers.discount.applyDiscount);
router.get('/users/:userId/discounts/:targetType', controllers.discount.getEligibleDiscounts);
