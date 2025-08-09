import Joi from 'joi';
import { ProjectRequestStatusType, ResourceStatus, ResourceType } from '../generated/prisma';

const createResource = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
    resourceType: Joi.string()
      .valid(...Object.values(ResourceType))
      .required(),
    inspirationLinks: Joi.array().items(Joi.string()),
    referenceLinks: Joi.array().items(Joi.string()),
    tags: Joi.array().items(Joi.string()),
    clientId: Joi.number(),
    mediaSpecifications: Joi.object()
      .keys({
        videoType: Joi.string(),
        audioType: Joi.string(),
        designType: Joi.string(),
        codeType: Joi.string(),
      })
      .required(),
    brandingGuidelines: Joi.object()
      .keys({
        primaryColor: Joi.string(),
        secondaryColor: Joi.string(),
        accentColors: Joi.array().items(Joi.string()),
        typography: Joi.string(),
        logoUrl: Joi.string(),
        brandVoice: Joi.string(),
        styleGuideUrl: Joi.string(),
      })
      .required(),
  }),
};

const getResource = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
};

const updateResource = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string(),
    resourceType: Joi.string().valid(...Object.values(ResourceType)),
    inspirationLinks: Joi.array().items(Joi.string()),
    referenceLinks: Joi.array().items(Joi.string()),
    tags: Joi.array().items(Joi.string()),
    status: Joi.string().valid(...Object.values(ResourceStatus)),
    clientId: Joi.number(),
    mediaSpecifications: Joi.object().keys({
      videoType: Joi.string(),
      audioType: Joi.string(),
      designType: Joi.string(),
      codeType: Joi.string(),
    }),
    brandingGuidelines: Joi.object().keys({
      primaryColor: Joi.string(),
      secondaryColor: Joi.string(),
      accentColors: Joi.array().items(Joi.string()),
      typography: Joi.string(),
      logoUrl: Joi.string(),
      brandVoice: Joi.string(),
      styleGuideUrl: Joi.string(),
    }),
  }),
};

const addDocumentToResource = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
  body: Joi.object().keys({
    documentId: Joi.number().required(),
  }),
};

const createProjectRequest = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    timeline: Joi.string(),
    requirements: Joi.string(),
    clientId: Joi.number().required(),
    resourceId: Joi.number().required(),
  }),
};

const getProjectRequest = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
};

const updateProjectRequestStatus = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string()
      .valid(...Object.values(ProjectRequestStatusType))
      .required(),
    reviewNotes: Joi.string(),
  }),
};

const linkProjectRequestToProject = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
  body: Joi.object().keys({
    projectId: Joi.number().required(),
  }),
};

const getClientProjectRequests = {
  query: Joi.object().keys({
    status: Joi.string().custom((value, helpers) => {
      if (!value) return value;
      const statuses = value.split(',');
      const validStatuses = Object.values(ProjectRequestStatusType);
      const isValid = statuses.every((status: string) =>
        validStatuses.includes(status as ProjectRequestStatusType),
      );
      if (!isValid) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    fromDate: Joi.date().iso(),
    toDate: Joi.date().iso(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'status').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

const getAllProjectRequests = {
  query: Joi.object().keys({
    status: Joi.string(),
    clientId: Joi.number(),
    fromDate: Joi.date().iso(),
    toDate: Joi.date().iso(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1),
    search: Joi.string().allow(''),
  }),
};

const getMyProjectRequests = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({
    status: Joi.string().custom((value, helpers) => {
      if (!value) return value;
      const statuses = value.split(',');
      const validStatuses = Object.values(ProjectRequestStatusType);
      const isValid = statuses.every((status: string) =>
        validStatuses.includes(status as ProjectRequestStatusType),
      );
      if (!isValid) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    fromDate: Joi.date().iso(),
    toDate: Joi.date().iso(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'status').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export default {
  createResource,
  getResource,
  updateResource,
  addDocumentToResource,
  createProjectRequest,
  getProjectRequest,
  updateProjectRequestStatus,
  linkProjectRequestToProject,
  getClientProjectRequests,
  getAllProjectRequests,
  getMyProjectRequests,
};
