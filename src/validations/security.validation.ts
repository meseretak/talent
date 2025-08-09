import Joi from 'joi';

const enable2FASchema = Joi.object({
  userId: Joi.number().integer().required(),
});

const verify2FASchema = Joi.object({
  userId: Joi.number().integer().required(),
  token: Joi.string().required(),
});

const verifyCodeSchema = Joi.object({
  userId: Joi.number().integer().required(),
  code: Joi.string().required(),
});

export default {
  enable2FASchema,
  verify2FASchema,
  verifyCodeSchema,
};
