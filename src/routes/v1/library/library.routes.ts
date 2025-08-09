import { Router } from 'express';
import { LibraryCategoryController } from '../../../controllers/v1/library/library-category.controller';
import { LibraryEngagementController } from '../../../controllers/v1/library/library-engagement.controller';
import { LibraryController } from '../../../controllers/v1/library/library.controller';
import auth from '../../../middlewares/auth';
import validate from '../../../middlewares/validate';
import libraryCategoryValidation from '../../../validations/library-category.validation';
import libraryValidation from '../../../validations/library.validation';

const router = Router();
const libraryController = new LibraryController();
const categoryController = new LibraryCategoryController();
const engagementController = new LibraryEngagementController();

// Public routes
router.get(
  '/resources',
  validate(libraryValidation.listResources),
  libraryController.getPublishedResources,
);

router.get(
  '/resources/all',
  auth('manageLibrary'),
  // auth(),
  validate(libraryValidation.getAllResources),
  libraryController.getAllResources,
);
// Get all resources (Admin only) or single resource
router.get(
  '/resources/:id',
  validate(libraryValidation.getResource),
  libraryController.getResourceById,
);

router.get(
  '/progress',
  auth(),
  validate(libraryValidation.getUserProgress),
  libraryController.getUserProgress,
);

router.patch(
  '/resources/:resourceId/progress',
  auth(),
  validate(libraryValidation.updateProgress),
  libraryController.updateProgress,
);

router.post(
  '/resources/:resourceId/favorite',
  auth(),
  validate(libraryValidation.toggleFavorite),
  libraryController.toggleFavorite,
);

router.post(
  '/resources',
  auth(),
  validate(libraryValidation.createResource),
  libraryController.createResource,
);

router.put(
  '/resources/:id',
  auth(),
  validate(libraryValidation.updateResource),
  libraryController.updateResource,
);

router.delete(
  '/resources/:id',
  auth(),
  validate(libraryValidation.deleteResource),
  libraryController.deleteResource,
);

// Public routes
router.get(
  '/categories',
  validate(libraryCategoryValidation.listCategories),
  categoryController.getCategories,
);

router.get('/categories/stats', categoryController.getCategoriesWithStats);

router.get(
  '/categories/:id',
  validate(libraryCategoryValidation.getCategory),
  categoryController.getCategoryById,
);

// Admin only routes
router.post(
  '/categories',
  auth(),
  validate(libraryCategoryValidation.createCategory),
  categoryController.createCategory,
);

router.put(
  '/categories/:id',
  auth(),
  validate(libraryCategoryValidation.updateCategory),
  categoryController.updateCategory,
);

router.delete(
  '/categories/:id',
  auth(),
  validate(libraryCategoryValidation.deleteCategory),
  categoryController.deleteCategory,
);

router.patch(
  '/categories/:id/deactivate',
  auth(),
  validate(libraryCategoryValidation.deactivateCategory),
  categoryController.deactivateCategory,
);

// Pin/Unpin routes
router.post(
  '/resources/:resourceId/pin',
  auth(),
  validate(libraryValidation.resourceId),
  engagementController.togglePin,
);

router.get('/pins', auth(), validate(libraryValidation.listPins), engagementController.getUserPins);

// Get certificates (read-only)
router.get(
  '/certificates',
  auth(),
  validate(libraryValidation.listCertificates),
  engagementController.getUserCertificates,
);

// Reaction routes
router.post(
  '/comments/:commentId/reactions',
  auth(),
  validate(libraryValidation.toggleReaction),
  engagementController.toggleReaction,
);

router.post(
  '/replies/:replyId/reactions',
  auth(),
  validate(libraryValidation.toggleReaction),
  engagementController.toggleReaction,
);

router.get(
  '/comments/:commentId/reactions',
  validate(libraryValidation.getReactions),
  engagementController.getReactionCounts,
);

router.get(
  '/replies/:replyId/reactions',
  validate(libraryValidation.getReactions),
  engagementController.getReactionCounts,
);

// Admin routes

export default router;
