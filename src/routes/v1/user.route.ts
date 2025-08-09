import express from 'express';
import { userController } from '../../controllers/v1';
import auth from '../../middlewares/auth';
import { uploadAvatar } from '../../middlewares/uploads';
import validate from '../../middlewares/validate';
import { userValidation } from '../../validations';

const router = express.Router();

router
  .route('/')
  .post(auth('register'), validate(userValidation.createUser), userController.createUserController)
  .get(auth('getUsers'), validate(userValidation.getUsers), userController.getUsersController);

router
  .route('/:userId')
  .get(auth('getUsers'), validate(userValidation.getUser), userController.getUserController)
  .patch(
    auth('manageUsers'),
    validate(userValidation.updateUser),
    userController.updateUserController,
  )
  .delete(
    auth('manageUsers'),
    validate(userValidation.deleteUser),
    userController.deleteUserController,
  );
router
  .route('/:userId/profile')
  .patch(
    auth('manageUsers'),
    uploadAvatar,
    validate(userValidation.updateUserProfile),
    userController.updateUserProfileController,
  );

export default router;
