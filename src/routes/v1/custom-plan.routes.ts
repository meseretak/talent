import { Router } from 'express';
import {
  createCustomPlanPaymentLink,
  createCustomPlanRequest,
  getCustomPlanRequestById,
  getCustomPlanRequests,
  updateCustomPlanRequest,
  updateCustomPlanRequestStatus,
} from '../../controllers/v1/subscription/custom-plan.controller';
import validate from '../../middlewares/validate';
import { planCustomValidation } from '../../validations';

const router = Router();

/**
 * @route POST /api/v1/custom-plan
 * @desc Create a new custom plan request
 * @access Private
 * @example Request:
 * {
 *   "clientId": 123,
 *   "requestedCredits": 1000,
 *   "requestedBrands": 5,
 *   "durationMonths": 3
 * }
 * @example Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "cpl_123",
 *     "clientId": 123,
 *     "requestedCredits": 1000,
 *     "requestedBrands": 5,
 *     "durationMonths": 3,
 *     "status": "PENDING",
 *     "createdAt": "2023-05-01T12:00:00Z",
 *     "updatedAt": "2023-05-01T12:00:00Z"
 *   }
 * }
 */
router.post('/', createCustomPlanRequest);

/**
 * @route GET /api/v1/custom-plan
 * @desc Get all custom plan requests, can filter by status and clientId
 * @access Private
 * @example Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "cpl_123",
 *       "clientId": 123,
 *       "requestedCredits": 1000,
 *       "requestedBrands": 5,
 *       "durationMonths": 3,
 *       "status": "PENDING",
 *       "createdAt": "2023-05-01T12:00:00Z",
 *       "updatedAt": "2023-05-01T12:00:00Z",
 *       "clients": {
 *         "user": {
 *           "email": "client@example.com",
 *           "firstName": "John",
 *           "lastName": "Doe"
 *         }
 *       }
 *     }
 *   ]
 * }
 */
router.get('/', getCustomPlanRequests);

/**
 * @route GET /api/v1/custom-plan/:id
 * @desc Get a custom plan request by ID
 * @access Private
 * @example Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "cpl_123",
 *     "clientId": 123,
 *     "requestedCredits": 1000,
 *     "requestedBrands": 5,
 *     "durationMonths": 3,
 *     "status": "PENDING",
 *     "createdAt": "2023-05-01T12:00:00Z",
 *     "updatedAt": "2023-05-01T12:00:00Z",
 *     "clients": {
 *       "user": {
 *         "email": "client@example.com",
 *         "firstName": "John",
 *         "lastName": "Doe"
 *       }
 *     }
 *   }
 * }
 */
router.get('/:id', getCustomPlanRequestById);

/**
 * @route PUT /api/v1/custom-plan/:id
 * @desc Update a custom plan request details
 * @access Private
 * @example Request:
 * {
 *   "requestedCredits": 2000,
 *   "requestedBrands": 10,
 *   "durationMonths": 6
 * }
 * @example Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "cpl_123",
 *     "clientId": 123,
 *     "requestedCredits": 2000,
 *     "requestedBrands": 10,
 *     "durationMonths": 6,
 *     "status": "PENDING",
 *     "createdAt": "2023-05-01T12:00:00Z",
 *     "updatedAt": "2023-05-01T12:00:00Z"
 *   }
 * }
 */
router.put('/:id', validate(planCustomValidation.updateCustomPlan), updateCustomPlanRequest);

/**
 * @route PUT /api/v1/custom-plan/:id/status
 * @desc Update a custom plan request status
 * @access Private
 * @example Request:
 * {
 *   "status": "APPROVED"
 * }
 * @example Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "cpl_123",
 *     "clientId": 123,
 *     "requestedCredits": 1000,
 *     "requestedBrands": 5,
 *     "durationMonths": 3,
 *     "status": "APPROVED",
 *     "createdAt": "2023-05-01T12:00:00Z",
 *     "updatedAt": "2023-05-01T12:00:00Z"
 *   }
 * }
 */
router.put(
  '/:id/status',
  validate(planCustomValidation.updateCustomPlanStatus),
  updateCustomPlanRequestStatus,
);

/**
 * @route POST /api/v1/custom-plan/:id/payment-link
 * @desc Create a payment link for a custom plan request
 * @access Private
 * @example Response:
 * {
 *   "success": true,
 *   "data": "https://checkout.stripe.com/c/pay/cs_1234567890"
 * }
 */
router.post('/:id/payment-link', createCustomPlanPaymentLink);

export default router;
