import Joi from 'joi';
import { Role } from '../generated/prisma';
import { password } from './custom.validation';

const register = {
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

const registerFreelancer = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    middleName: Joi.string().optional(),
    role: Joi.string().required().valid(Role.FREELANCER),
    bio: Joi.string().optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    experience: Joi.string().optional(),
    education: Joi.string().optional(),
    skillIds: Joi.array().items(Joi.number()).optional(),
    categoryIds: Joi.array().items(Joi.number()).optional(),
    availableHoursPerWeek: Joi.number().optional(),
    availabilityNotes: Joi.string().optional(),
    headline: Joi.string().optional(),
    workHistory: Joi.array()
      .items(
        Joi.object({
          companyName: Joi.string().required(),
          position: Joi.string().required(),
          startDate: Joi.date().required(),
          endDate: Joi.date().optional(),
          description: Joi.string().optional(),
        }),
      )
      .optional(),
    certifications: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          issuingOrganization: Joi.string().required(),
          issueDate: Joi.date().required(),
          expirationDate: Joi.date().optional(),
          credentialId: Joi.string().optional(),
        }),
      )
      .optional(),
    portfolio: Joi.array()
      .items(
        Joi.object({
          title: Joi.string().required(),
          description: Joi.string().optional(),
          imageURL: Joi.string().optional(),
          projectURL: Joi.string().optional(),
        }),
      )
      .optional(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const sendVerificationEmail = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const verifyEmailWithOTP = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required(),
  }),
};
const changePassword = {
  body: Joi.object().keys({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required().custom(password),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')),
  }),
};

export default {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  registerFreelancer,
  sendVerificationEmail,
  changePassword,
  verifyEmailWithOTP,
};
