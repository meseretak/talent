import httpStatus from 'http-status';
import { userService } from '../../services';
import ApiError from '../../utils/ApiError';
import catchAsync from '../../utils/catchAsync';
import pick from '../../utils/pick';

const createUser = catchAsync(async (req, res) => {
  const { email, password, firstName, lastName, middleName, role } = req.body;
  const user = await userService.createUser({
    email,
    password,
    firstName,
    lastName,
    middleName,
    role,
  });
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['firstName', 'lastName', 'middleName', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
