import express from 'express';
import documentController from '../../../controllers/v1/project/document.controller';
import auth from '../../../middlewares/auth';

const router = express.Router();

router.route('/').post(auth('documents'), documentController.createDocument);

router.route('/project/:projectId').get(auth('documents'), documentController.listProjectDocuments);

router
  .route('/:id')
  .get(auth('documents'), documentController.getDocumentById)
  .patch(auth('documents'), documentController.updateDocument)
  .delete(auth('documents'), documentController.deleteDocument);

router.route('/:id/versions').post(auth('documents'), documentController.createDocumentVersion);

router.route('/folders').post(auth('documents'), documentController.createFolder);

router
  .route('/folders/project/:projectId')
  .get(auth('documents'), documentController.listProjectFolders);

router
  .route('/folders/:id')
  .get(auth('documents'), documentController.getFolderById)
  .patch(auth('documents'), documentController.updateFolder)
  .delete(auth('documents'), documentController.deleteFolder);

router.route('/:id/move').post(auth('documents'), documentController.moveDocumentToFolder);

export default router;
