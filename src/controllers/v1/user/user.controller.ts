import fs from 'fs';
import httpStatus from 'http-status';
import multer from 'multer';
import path from 'path';
import { userService } from '../../../services';
import ApiError from '../../../utils/ApiError';
import catchAsync from '../../../utils/catchAsync';
import pick from '../../../utils/pick';

// * Create User
const createUserController = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

// * Get Users
const getUsersController = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'firstName',
    'lastName',
    'middleName',
    'role',
    'isEmailVerified',
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'sortType', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

// * Get User
const getUserController = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

// * Update User
const updateUserController = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

// * Delete User
const deleteUserController = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

// Ensure the uploads/userAvatar directory exists
const uploadDir = path.join(__dirname, '../../uploads/userAvatar');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use userId + timestamp + ext for uniqueness
    const ext = path.extname(file.originalname);
    const userId = req.params.userId || 'unknown';
    cb(null, `${userId}_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

export const uploadAvatar = upload.single('avatar');

const updateUserProfileController = catchAsync(async (req, res) => {
  let avatarUrl = req.body.avatar;

  // If a file was uploaded, construct the URL
  if (req.file) {
    // Assuming your server serves /uploads as static files
    avatarUrl = `/uploads/userAvatar/${req.file.filename}`;
  }

  const { firstName, lastName, middleName } = req.body;
  const user = await userService.updateUserProfile(req.params.userId, {
    avatar: avatarUrl,
    firstName,
    lastName,
    middleName,
  });
  res.send(user);
});

export default {
  createUserController,
  getUsersController,
  getUserController,
  updateUserController,
  updateUserProfileController,
  deleteUserController,
};
