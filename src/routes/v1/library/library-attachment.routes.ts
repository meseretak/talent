import { Router } from 'express';
import { LibraryAttachmentController } from '../../../controllers/v1/library/library-attachment.controller';
import auth from '../../../middlewares/auth';
import validate from '../../../middlewares/validate';
import libraryAttachmentValidation from '../../../validations/library-attachment.validation';

const router = Router();
const attachmentController = new LibraryAttachmentController();

// Create attachment (requires authentication)
router.post(
  '/',
  auth(),
  validate(libraryAttachmentValidation.createAttachment),
  attachmentController.createAttachment,
);

// Get attachments for a resource
router.get(
  '/resource/:resourceId',
  validate(libraryAttachmentValidation.getResourceAttachments),
  attachmentController.getResourceAttachments,
);

// Get total size of attachments for a resource
router.get(
  '/resource/:resourceId/size',
  validate(libraryAttachmentValidation.getResourceAttachments),
  attachmentController.getResourceAttachmentsSize,
);

// Get single attachment
router.get(
  '/:id',
  validate(libraryAttachmentValidation.getAttachment),
  attachmentController.getAttachment,
);

// Update attachment (requires authentication)
router.put(
  '/:id',
  auth(),
  validate(libraryAttachmentValidation.updateAttachment),
  attachmentController.updateAttachment,
);

// Delete attachment (requires authentication)
router.delete(
  '/:id',
  auth(),
  validate(libraryAttachmentValidation.deleteAttachment),
  attachmentController.deleteAttachment,
);

export default router;
