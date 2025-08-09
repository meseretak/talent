import { Router } from 'express';
import { LibraryCommentController } from '../../../controllers/v1/library/library-comment.controller';
import auth from '../../../middlewares/auth';
import validate from '../../../middlewares/validate';
import libraryCommentValidation from '../../../validations/library-comment.validation';

const router = Router();
const commentController = new LibraryCommentController();

// Create comment or reply (requires authentication)
router.post(
  '/',
  auth(),
  validate(libraryCommentValidation.createComment),
  commentController.createComment,
);

// Get comments for a resource
router.get(
  '/resource/:resourceId',
  validate(libraryCommentValidation.getResourceComments),
  commentController.getResourceComments,
);

// Update comment (requires authentication)
router.put(
  '/:id',
  auth(),
  validate(libraryCommentValidation.updateComment),
  commentController.updateComment,
);

// Delete comment (requires authentication)
router.delete(
  '/:id',
  auth(),
  validate(libraryCommentValidation.deleteComment),
  commentController.deleteComment,
);

// Toggle reaction on a comment (requires authentication)
router.post(
  '/:id/reactions',
  auth(),
  validate(libraryCommentValidation.toggleReaction),
  commentController.toggleReaction,
);

export default router;
