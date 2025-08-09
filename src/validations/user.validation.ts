import Joi from 'joi';
import { Role } from '../generated/prisma';
import { password } from './custom.validation';

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    middleName: Joi.string().optional(),
    role: Joi.string()
      .required()
      .valid(Role.SUPER_ADMIN, Role.ADMIN, Role.PROJECT_MANAGER, Role.FREELANCER, Role.CLIENT),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    middleName: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    sortType: Joi.string().valid('asc', 'desc'),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      firstName: Joi.string(),
      lastName: Joi.string(),
      middleName: Joi.string(),
      role: Joi.string().valid(
        Role.SUPER_ADMIN,
        Role.ADMIN,
        Role.PROJECT_MANAGER,
        Role.FREELANCER,
        Role.CLIENT,
      ),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
};
const updateUserProfile = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
  body: Joi.object()
    .keys({
      avatar: Joi.string().uri().optional(),
      firstName: Joi.string().min(1).max(50).optional(),
      lastName: Joi.string().min(1).max(50).optional(),
      middleName: Joi.string().max(50).optional(),
    })
    .min(1),
};
export default {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserProfile,
};
