import Joi from 'joi';

const addFreelancerReview = {
  params: Joi.object().keys({
    freelancerId: Joi.number().required(),
  }),
  body: Joi.object().keys({
    rating: Joi.number().min(0).max(5).required(),
    reviewText: Joi.string().allow('', null),
    comment: Joi.string().allow('', null),
    clientId: Joi.number().required(),
    projectId: Joi.number().optional(),
  }),
};

const getFreelancerReviews = {
  params: Joi.object().keys({
    freelancerId: Joi.number().required(),
  }),
};

const updateFreelancerReview = {
  params: Joi.object().keys({
    reviewId: Joi.number().required(),
  }),
  body: Joi.object().keys({
    rating: Joi.number().min(0).max(5),
    reviewText: Joi.string().allow('', null),
    comment: Joi.string().allow('', null),
  }).min(1), // At least one field must be provided
};

const deleteFreelancerReview = {
  params: Joi.object().keys({
    reviewId: Joi.number().required(),
  }),
};

export default {
  addFreelancerReview,
  getFreelancerReviews,
  updateFreelancerReview,
  deleteFreelancerReview,
};