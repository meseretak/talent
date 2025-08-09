import Joi from 'joi';
import { password } from './custom.validation';

const createProjectManager = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    middleName: Joi.string().optional(),
    avatar: Joi.string().uri().optional(),
  }),
};

const getProjectManager = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

const getProjectManagers = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    search: Joi.string().allow(''),
    status: Joi.string().allow(''),
  }),
};

const updateProjectManager = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      firstName: Joi.string(),
      lastName: Joi.string(),
      middleName: Joi.string(),
      avatar: Joi.string().uri(),
    })
    .min(1),
};

const deleteProjectManager = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

const assignProject = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
  body: Joi.object().keys({
    projectId: Joi.number().integer().required(),
  }),
};

const assignTask = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
  body: Joi.object().keys({
    taskId: Joi.number().integer().required(),
  }),
};

const getManagedProjects = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

const getManagedTasks = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

const getPerformanceMetrics = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

const isProjectManager = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

export default {
  createProjectManager,
  getProjectManager,
  getProjectManagers,
  updateProjectManager,
  deleteProjectManager,
  assignProject,
  assignTask,
  getManagedProjects,
  getManagedTasks,
  getPerformanceMetrics,
  isProjectManager,
};
