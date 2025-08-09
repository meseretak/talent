import express from 'express';
import { freelancerController } from '../../controllers/v1';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { freelancerValidation } from '../../validations';
import reviewValidation from '../../validations/review.validation';

const router = express.Router();

// --- Skills & Categories ---

router.get('/skills', freelancerController.getSkills);
router.get('/categories', freelancerController.getCategories);

// --- Core Freelancer Routes ---

router.get('/', freelancerController.getAllFreelancers);

router.get('/card-view', freelancerController.getFreelancersForCardView);

// Featured freelancer routes (before any :freelancerId routes)
router
  .route('/featured')
  .get(
    validate(freelancerValidation.getFeaturedFreelancers),
    freelancerController.getFeaturedFreelancers,
  );

// Registration and profile routes
router.post(
  '/register',
  auth('manageFreelancers'), // Assuming only admins can register users directly this way
  validate(freelancerValidation.register),
  freelancerController.register,
);

router.post(
  '/profile',
  auth('freelancer'), // User must be logged in as a freelancer
  validate(freelancerValidation.registerProfile),
  freelancerController.registerProfile,
);

router.patch(
  '/profile',
  auth('freelancer'), // User must be logged in as a freelancer
  validate(freelancerValidation.updateProfile),
  freelancerController.updateProfile,
);

router.patch(
  '/:id',
  auth('freelancer'), // User must be logged in as a freelancer
  validate(freelancerValidation.updateProfile),
  freelancerController.adminUpdateFreelancerInfo,
);

router.patch(
  '/:id/status',
  auth('manageFreelancers'), // Assuming only admins/managers can change status
  validate(freelancerValidation.updateStatus),
  freelancerController.updateFreelancerStatus,
);

router
  .route('/:freelancerId/featured')
  .patch(
    auth('manageFreelancers'),
    validate(freelancerValidation.toggleFeaturedStatus),
    freelancerController.toggleFeaturedStatus,
  );

router.get(
  '/search',
  validate(freelancerValidation.searchFreelancers),
  freelancerController.searchFreelancers,
);

router.get(
  '/to-client/search',
  validate(freelancerValidation.searchFreelancers),
  freelancerController.searchFreelancers,
);

router.get(
  '/client-dashboard/search',
  validate(freelancerValidation.searchFreelancers),
  freelancerController.searchClientDashboardFreelancers,
);

router.get(
  '/:id',
  validate(freelancerValidation.getFreelancer), // Added validation
  freelancerController.getFreelancerById,
);

router.post(
  '/skills',
  auth('manageSkills'), // Example: Requires permission to manage skills
  validate(freelancerValidation.addSkill),
  freelancerController.addSkill,
);

router.post(
  '/categories',
  auth('manageCategories'), // Example: Requires permission to manage categories
  validate(freelancerValidation.addCategory),
  freelancerController.addCategory,
);

// --- Work History ---

router.post(
  '/:freelancerId/work-history',
  auth('freelancerData'), // Example: Freelancer can add to own profile, or admin
  validate(freelancerValidation.addWorkHistory),
  freelancerController.addWorkHistory,
);

router.get(
  '/:freelancerId/work-history',
  validate(freelancerValidation.getWorkHistory),
  freelancerController.getWorkHistory,
);

// Note: Routes for updating/deleting specific items often don't include the parent ID
router.patch(
  '/work-history/:workHistoryId',
  auth('freelancerData'),
  validate(freelancerValidation.updateWorkHistory),
  freelancerController.updateWorkHistory,
);

router.delete(
  '/work-history/:workHistoryId',
  auth('freelancerData'),
  validate(freelancerValidation.deleteWorkHistory),
  freelancerController.deleteWorkHistory,
);

// --- Portfolio Items ---

router.post(
  '/:freelancerId/portfolio',
  auth('freelancerData'), // Example: Freelancer can add to own profile, or admin
  validate(freelancerValidation.addPortfolioItem),
  freelancerController.addPortfolioItem,
);

router.get(
  '/:freelancerId/portfolio',
  // Optional: Add auth if viewing requires login
  validate(freelancerValidation.getPortfolioItems),
  freelancerController.getPortfolioItems,
);

router.patch(
  '/portfolio/:portfolioItemId',
  auth('freelancerData'), // Example: Owner of the item or admin
  validate(freelancerValidation.updatePortfolioItem),
  freelancerController.updatePortfolioItem,
);

router.delete(
  '/portfolio/:portfolioItemId',
  auth('freelancerData'),
  validate(freelancerValidation.deletePortfolioItem),
  freelancerController.deletePortfolioItem,
);

// Routes for freelancer reviews
router
  .route('/:freelancerId/reviews')
  .post(validate(reviewValidation.addFreelancerReview), freelancerController.addFreelancerReview)
  .get(validate(reviewValidation.getFreelancerReviews), freelancerController.getFreelancerReviews);

router
  .route('/reviews/:reviewId')
  .patch(
    validate(reviewValidation.updateFreelancerReview),
    freelancerController.updateFreelancerReview,
  )
  .delete(
    validate(reviewValidation.deleteFreelancerReview),
    freelancerController.deleteFreelancerReview,
  );

// Add this before the export default router
router.delete(
  '/:freelancerId',
  auth('manageFreelancers'), // Only admins can delete freelancers
  validate(freelancerValidation.deleteFreelancer),
  freelancerController.deleteFreelancer,
);

export default router;
