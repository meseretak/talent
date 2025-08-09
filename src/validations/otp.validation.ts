import Joi from 'joi';

const generateOTP = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
};

const verifyOTP = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    otp: Joi.string().required().length(6),
  }),
};

export default {
  generateOTP,
  verifyOTP,
};