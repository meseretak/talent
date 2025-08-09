import Joi from 'joi';
import { TaskStatus } from '../generated/prisma';

const createMilestone = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().allow('', null),
    dueDate: Joi.date().required(),
    status: Joi.string().valid(...Object.values(TaskStatus)),
  }),
  params: Joi.object().keys({
    projectId: Joi.number().integer().required(),
  }),
};

const getMilestone = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

const updateMilestone = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string().allow('', null),
      dueDate: Joi.date(),
      status: Joi.string().valid(...Object.values(TaskStatus)),
    })
    .min(1),
};

const deleteMilestone = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

const listMilestones = {
  params: Joi.object().keys({
    projectId: Joi.number().integer().required(),
  }),
};

const getMilestoneProgress = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

const addTaskToMilestone = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
    taskId: Joi.number().integer().required(),
  }),
};

const removeTaskFromMilestone = {
  params: Joi.object().keys({
    taskId: Joi.number().integer().required(),
  }),
};

export default {
  createMilestone,
  getMilestone,
  updateMilestone,
  deleteMilestone,
  listMilestones,
  getMilestoneProgress,
  addTaskToMilestone,
  removeTaskFromMilestone,
};
