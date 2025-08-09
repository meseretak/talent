import Joi from 'joi';
import { LibReactionType } from '../generated/prisma';

const createComment = {
  body: Joi.object().keys({
    content: Joi.string().required(),
    resourceId: Joi.string().required(),
    commentId: Joi.string(), // Optional, for replies
  }),
};

const getResourceComments = {
  params: Joi.object().keys({
    resourceId: Joi.string().required(),
  }),
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
  }),
};

const updateComment = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    content: Joi.string().required(),
  }),
};

const deleteComment = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const toggleReaction = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    type: Joi.string()
      .valid(...Object.values(LibReactionType))
      .required(),
  }),
};

export default {
  createComment,
  getResourceComments,
  updateComment,
  deleteComment,
  toggleReaction,
};
