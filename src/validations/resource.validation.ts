import Joi from 'joi';
import { ResourceStatus, ResourceType } from '../generated/prisma';

const createResource = {
  body: Joi.object().keys({
    name: Joi.string().required().min(3).max(100),
    description: Joi.string().min(10),
    type: Joi.string()
      .required()
      .valid(...Object.values(ResourceType)),
    url: Joi.string().required().uri(),
    projectId: Joi.number().required().positive(),
    taskId: Joi.number().positive(),
  }),
};

const updateResourceStatus = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    status: Joi.string()
      .required()
      .valid(...Object.values(ResourceStatus)),
  }),
};

const getResource = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

const getProjectResources = {
  params: Joi.object().keys({
    projectId: Joi.number().required().positive(),
  }),
  query: Joi.object().keys({
    type: Joi.string().custom((value, helpers) => {
      const types = value.split(',');
      const validTypes = Object.values(ResourceType);
      const isValid = types.every((type: string) => validTypes.includes(type as ResourceType));
      if (!isValid) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    status: Joi.string().valid(...Object.values(ResourceStatus)),
    uploadedById: Joi.number().positive(),
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc'),
  }),
};

const getTaskResources = {
  params: Joi.object().keys({
    taskId: Joi.number().required().positive(),
  }),
  query: Joi.object().keys({
    type: Joi.string().custom((value, helpers) => {
      const types = value.split(',');
      const validTypes = Object.values(ResourceType);
      const isValid = types.every((type: string) => validTypes.includes(type as ResourceType));
      if (!isValid) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    status: Joi.string().valid(...Object.values(ResourceStatus)),
  }),
};

const attachResourceToTask = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    taskId: Joi.number().required().positive(),
  }),
};

const searchResources = {
  query: Joi.object().keys({
    projectId: Joi.number().positive(),
    type: Joi.string().custom((value, helpers) => {
      const types = value.split(',');
      const validTypes = Object.values(ResourceType);
      const isValid = types.every((type: string) => validTypes.includes(type as ResourceType));
      if (!isValid) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    status: Joi.string().valid(...Object.values(ResourceStatus)),
    uploadedById: Joi.number().positive(),
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    query: Joi.string().min(2),
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc'),
  }),
};

export default {
  createResource,
  updateResourceStatus,
  getResource,
  getProjectResources,
  getTaskResources,
  attachResourceToTask,
  searchResources,
};
