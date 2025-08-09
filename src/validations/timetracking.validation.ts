import Joi from 'joi';

const startTimer = {
  body: Joi.object().keys({
    userId: Joi.number().integer(),
    taskId: Joi.number().integer().required(),
  }),
};

const stopTimer = {
  body: Joi.object().keys({
    userId: Joi.number().integer(),
    taskId: Joi.number().integer().required(),
    freelancerId: Joi.number().integer().required(),
    projectId: Joi.number().integer(),
  }),
};

const getActiveTimer = {
  query: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
};

const getUserTimeLogs = {
  params: Joi.object().keys({
    userId: Joi.number().integer().required(),
  }),
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    startDate: Joi.date(),
    endDate: Joi.date().when('startDate', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('startDate')).required(),
    }),
    taskId: Joi.number().integer(),
    projectId: Joi.number().integer(),
  }),
};

const getTaskTimeLogs = {
  params: Joi.object().keys({
    taskId: Joi.number().integer().required(),
  }),
};

const getProjectTimeLogs = {
  params: Joi.object().keys({
    projectId: Joi.number().integer().required(),
  }),
};

const getFreelancerTimeLogs = {
  params: Joi.object().keys({
    freelancerId: Joi.number().integer().required(),
  }),
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    startDate: Joi.date(),
    endDate: Joi.date().when('startDate', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('startDate')).required(),
    }),
    taskId: Joi.number().integer(),
    projectId: Joi.number().integer(),
  }),
};

export default {
  startTimer,
  stopTimer,
  getActiveTimer,
  getUserTimeLogs,
  getTaskTimeLogs,
  getProjectTimeLogs,
  getFreelancerTimeLogs,
};
