import { Router } from 'express';
import upload from '../../config/multer';
import { uploadFile } from '../../controllers/v1/upload.controller';
import validate from '../../middlewares/validate';
import { uploaderValidation } from '../../validations';

const router = Router();

// Support both 'file' and 'attachment' field names
router.post(
  '/upload',
  validate(uploaderValidation.uploadFile),
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'attachment', maxCount: 1 },
  ]),
  uploadFile,
);

export default router;
