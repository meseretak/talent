import { Router } from 'express';
import {
  createCheckoutSession,
  createCustomPlanCheckout,
  createPortalSession,
  getInvoice,
  getPaymentHistory,
  refundPayment,
  updatePaymentMethod,
} from '../../controllers/v1/subscription/payment.controller';

const router = Router();

// Protected routes
// router.use(auth);

/**
 * @route POST /api/v1/payment/checkout
 * @desc Create a checkout session for a plan
 * @access Private
 * @example Request:
 * {
 *   "planId": "plan_123",
 *   "clientId": 123
 * }
 * @example Response:
 * {
 *   "success": true,
 *   "data": "https://checkout.stripe.com/c/pay/cs_1234567890"
 * }
 */
router.post('/checkout', createCheckoutSession);

/**
 * @route POST /api/v1/payment/custom-plan/:requestId/checkout
 * @desc Create a checkout session for a custom plan
 * @access Private
 * @example Response:
 * {
 *   "success": true,
 *   "data": "https://checkout.stripe.com/c/pay/cs_1234567890"
 * }
 */
router.post('/custom-plan/:requestId/checkout', createCustomPlanCheckout);

/**
 * @route POST /api/v1/payment/portal-session
 * @desc Create a customer portal session
 * @access Private
 * @example Request:
 * {
 *   "clientId": 123
 * }
 * @example Response:
 * {
 *   "success": true,
 *   "data": "https://billing.stripe.com/p/session/1234567890"
 * }
 */
router.post('/portal-session', createPortalSession);

/**
 * @route GET /api/v1/payment/history/:clientId
 * @desc Get payment history for a client
 * @access Private
 * @example Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "clientId": 123,
 *       "amount": 99.99,
 *       "currency": "USD",
 *       "type": "SUBSCRIPTION",
 *       "status": "PAID",
 *       "paymentMethod": "CREDIT_CARD",
 *       "paymentReference": "pi_1234567890",
 *       "description": "Monthly subscription payment",
 *       "metadata": {
 *         "planId": "plan_123",
 *         "priceId": "price_456"
 *       },
 *       "createdAt": "2024-03-25T10:00:00Z",
 *       "updatedAt": "2024-03-25T10:00:00Z"
 *     }
 *   ]
 * }
 */
router.get('/history/:clientId', getPaymentHistory);

/**
 * @route GET /api/v1/payment/invoice/:invoiceId
 * @desc Get invoice details
 * @access Private
 * @example Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "subscriptionId": "sub_1234567890",
 *     "amount": 99.99,
 *     "currency": "USD",
 *     "status": "PAID",
 *     "dueDate": "2024-04-01T00:00:00Z",
 *     "paidAt": "2024-03-25T10:00:00Z",
 *     "metadata": {
 *       "planId": "plan_123",
 *       "priceId": "price_456"
 *     },
 *     "createdAt": "2024-03-25T10:00:00Z",
 *     "updatedAt": "2024-03-25T10:00:00Z"
 *   }
 * }
 */
router.get('/invoice/:invoiceId', getInvoice);

/**
 * @route POST /api/v1/payment/refund
 * @desc Process a refund
 * @access Private
 * @example Request:
 * {
 *   "paymentId": "pi_1234567890",
 *   "amount": 99.99,
 *   "reason": "customer_requested"
 * }
 * @example Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "re_1234567890",
 *     "amount": 9999,
 *     "currency": "usd",
 *     "status": "succeeded"
 *   }
 * }
 */
router.post('/refund', refundPayment);

/**
 * @route POST /api/v1/payment/payment-method
 * @desc Update default payment method
 * @access Private
 * @example Request:
 * {
 *   "clientId": 123,
 *   "paymentMethodId": "pm_1234567890"
 * }
 * @example Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 123,
 *     "defaultPaymentMethod": "pm_1234567890"
 *   }
 * }
 */
router.post('/payment-method', updatePaymentMethod);

export default router;
