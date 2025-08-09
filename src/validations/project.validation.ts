import Joi from 'joi';
import { ProjectStatusType } from '../generated/prisma';

const createProjectFromRequest = {
  body: Joi.object().keys({
    requestId: Joi.number().required().positive(),
  }),
};

const createProjectDirect = {
  body: Joi.object().keys({
    title: Joi.string().required().min(3).max(100),
    label: Joi.string().min(2).max(50),
    description: Joi.string().required().min(10),
    startDate: Joi.date().default(new Date()),
    endDate: Joi.date().min(Joi.ref('startDate')),
    clientId: Joi.number().required().positive(),
    budget: Joi.number().positive().default(0),
    color: Joi.string().default('#4A90E2'),
  }),
};

const createProject = {
  body: Joi.alternatives().try(
    Joi.object().keys({
      requestId: Joi.number().required().positive(),
    }),
    Joi.object().keys({
      title: Joi.string().required().min(3).max(100),
      label: Joi.string().min(2).max(50),
      description: Joi.string().required().min(10),
      startDate: Joi.date().default(new Date()),
      endDate: Joi.date().min(Joi.ref('startDate')),
      clientId: Joi.number().required().positive(),
      budget: Joi.number().positive().default(0),
      color: Joi.string().default('#4A90E2'),
    }),
  ),
};

const updateProject = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().min(3).max(100),
      description: Joi.string().min(10),
      status: Joi.string().valid(...Object.values(ProjectStatusType)),
      startDate: Joi.date(),
      endDate: Joi.date().min(Joi.ref('startDate')),
      budget: Joi.number().positive(),
      Color: Joi.string(),
    })
    .min(1),
};

const updateProjectStatus = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string()
      .valid(...Object.values(ProjectStatusType))
      .required(),
  }),
};

const assignProjectManager = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
  body: Joi.object().keys({
    managerId: Joi.number().required().positive(),
  }),
};

const getProject = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

const searchProjects = {
  query: Joi.object().keys({
    status: Joi.string().custom((value, helpers) => {
      const statuses = value.split(',');
      const validStatuses = Object.values(ProjectStatusType);
      const isValid = statuses.every((status: string) =>
        validStatuses.includes(status as ProjectStatusType),
      );
      if (!isValid) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    clientId: Joi.number().positive(),
    projectManagerId: Joi.number().positive(),
    freelancerId: Joi.number().positive(),
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc'),
  }),
};

const getAllProjects = {
  query: Joi.object().keys({
    status: Joi.string().custom((value, helpers) => {
      const statuses = value.split(',');
      const validStatuses = Object.values(ProjectStatusType);
      const isValid = statuses.every((status: string) =>
        validStatuses.includes(status as ProjectStatusType),
      );
      if (!isValid) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string()
      .valid('createdAt', 'name', 'budget', 'endDate', 'startDate')
      .default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().allow(''),
  }),
};

const getAssignedProjects = {
  query: Joi.object().keys({
    status: Joi.string().custom((value, helpers) => {
      const statuses = value.split(',');
      const validStatuses = Object.values(ProjectStatusType);
      const isValid = statuses.every((status: string) =>
        validStatuses.includes(status as ProjectStatusType),
      );
      if (!isValid) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string()
      .valid('createdAt', 'name', 'budget', 'endDate', 'startDate')
      .default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export default {
  createProject,
  createProjectFromRequest,
  createProjectDirect,
  updateProject,
  updateProjectStatus,
  assignProjectManager,
  getProject,
  searchProjects,
  getAllProjects,
  getAssignedProjects,
};
