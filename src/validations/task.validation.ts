import Joi from 'joi';
import { TaskPriorityType, TaskStatus } from '../generated/prisma';

const createTask = {
  body: Joi.object().keys({
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(10),
    projectId: Joi.number().required().positive(),
    assignedToId: Joi.number().positive(),
    dueDate: Joi.date().required(),
    priority: Joi.string()
      .required()
      .valid(...Object.values(TaskPriorityType)),
    estimatedHours: Joi.number().positive(),
  }),
};

const updateTaskStatus = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    status: Joi.string()
      .required()
      .valid(...Object.values(TaskStatus)),
  }),
};

const getTask = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

const getProjectTasks = {
  params: Joi.object().keys({
    projectId: Joi.number().required().positive(),
  }),
  query: Joi.object().keys({
    status: Joi.string().custom((value, helpers) => {
      const statuses = value.split(',');
      const validStatuses = Object.values(TaskStatus);
      const isValid = statuses.every((status: string) =>
        validStatuses.includes(status as TaskStatus),
      );
      if (!isValid) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    priority: Joi.string().valid(...Object.values(TaskPriorityType)),
    assignedToId: Joi.number().positive(),
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc'),
  }),
};

const assignTask = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    freelancerId: Joi.number().required().positive(),
  }),
};

const addTaskComment = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    content: Joi.string().required().min(1),
  }),
};

const taskTimer = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

export default {
  createTask,
  updateTaskStatus,
  getTask,
  getProjectTasks,
  assignTask,
  addTaskComment,
  taskTimer,
};
