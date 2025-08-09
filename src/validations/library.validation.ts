import Joi from 'joi';
import {
  LibAttachmentType,
  LibDifficultyLevel,
  LibReactionType,
  LibResourceStatus,
} from '../generated/prisma';

const createResource = {
  body: Joi.object().keys({
    title: Joi.string().required().trim(),
    description: Joi.string().required(),
    content: Joi.string().required(),
    keyPoints: Joi.string().allow('', null),
    difficulty: Joi.string().valid(...Object.values(LibDifficultyLevel)),
    duration: Joi.number().integer().min(1),
    categoryId: Joi.string().required(),
    thumbnailUrl: Joi.string().uri().allow('', null),
    status: Joi.string().valid(...Object.values(LibResourceStatus)),
    publishedAt: Joi.date().allow('', null),
    attachments: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          url: Joi.string().uri().required(),
          type: Joi.string()
            .valid(...Object.values(LibAttachmentType))
            .required(),
          description: Joi.string().allow('', null),
        }),
      )
      .optional()
      .max(5),
  }),
};

const getResource = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  query: Joi.object().keys({
    search: Joi.string().allow('', null),
    includeContent: Joi.boolean(),
    page: Joi.when('..params.id', {
      is: 'all',
      then: Joi.number().integer().min(1),
      otherwise: Joi.forbidden(),
    }),
    limit: Joi.when('..params.id', {
      is: 'all',
      then: Joi.number().integer().min(1).max(100),
      otherwise: Joi.forbidden(),
    }),
    categoryId: Joi.when('..params.id', {
      is: 'all',
      then: Joi.string(),
      otherwise: Joi.forbidden(),
    }),
    difficulty: Joi.when('..params.id', {
      is: 'all',
      then: Joi.string().valid(...Object.values(LibDifficultyLevel)),
      otherwise: Joi.forbidden(),
    }),
    status: Joi.when('..params.id', {
      is: 'all',
      then: Joi.string().valid(...Object.values(LibResourceStatus)),
      otherwise: Joi.forbidden(),
    }),
  }),
};

const updateResource = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().trim(),
      description: Joi.string(),
      content: Joi.string(),
      keyPoints: Joi.string().allow('', null),
      difficulty: Joi.string().valid(...Object.values(LibDifficultyLevel)),
      duration: Joi.number().integer().min(0),
      categoryId: Joi.string(),
      thumbnailUrl: Joi.string().uri().allow('', null),
      status: Joi.string().valid(...Object.values(LibResourceStatus)),
      allowComments: Joi.boolean(),
      attachments: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            url: Joi.string().uri().required(),
            type: Joi.string()
              .valid(...Object.values(LibAttachmentType))
              .required(),
            description: Joi.string().allow('', null),
          }),
        )
        .optional()
        .max(5),
    })
    .min(1),
};

const deleteResource = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const listResources = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    categoryId: Joi.string(),
    difficulty: Joi.string().valid(...Object.values(LibDifficultyLevel)),
    search: Joi.string().allow('', null),
  }),
};

const updateProgress = {
  params: Joi.object().keys({
    resourceId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    percentage: Joi.number().required().min(0).max(100),
  }),
};

const toggleFavorite = {
  params: Joi.object().keys({
    resourceId: Joi.string().required(),
  }),
};

const getAllResources = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    categoryId: Joi.string().optional(),
    difficulty: Joi.string()
      .valid(...Object.values(LibDifficultyLevel))
      .optional(),
    status: Joi.string()
      .valid(...Object.values(LibResourceStatus))
      .optional(),
    search: Joi.string().optional(),
  }),
};

const getUserProgress = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    search: Joi.string().allow('', null),
    status: Joi.string().valid(...Object.values(LibResourceStatus)),
  }),
};

const resourceId = {
  params: Joi.object().keys({
    resourceId: Joi.string().required(),
  }),
};

const listPins = {
  query: Joi.object().keys({
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
  }),
};

const listCertificates = {
  query: Joi.object().keys({
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
  }),
};

const toggleReaction = {
  params: Joi.object()
    .keys({
      commentId: Joi.string(),
      replyId: Joi.string(),
    })
    .xor('commentId', 'replyId')
    .required(),
  body: Joi.object().keys({
    type: Joi.string()
      .valid(...Object.values(LibReactionType))
      .required(),
  }),
};

const getReactions = {
  params: Joi.object()
    .keys({
      commentId: Joi.string(),
      replyId: Joi.string(),
    })
    .xor('commentId', 'replyId')
    .required(),
};

const libraryValidation = {
  createResource,
  getResource,
  updateResource,
  deleteResource,
  listResources,
  updateProgress,
  toggleFavorite,
  getAllResources,
  getUserProgress,
  resourceId,
  listPins,
  listCertificates,
  toggleReaction,
  getReactions,
};

export default libraryValidation;
