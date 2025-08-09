import Joi from 'joi';
import { AuditActionType } from '../generated/prisma';

const getAuditLogs = {
  query: Joi.object().keys({
    userId: Joi.number().positive(),
    action: Joi.string().valid(...Object.values(AuditActionType)),
    entityType: Joi.string(),
    entityId: Joi.number().positive(),
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc'),
  }),
};

const getEntityAuditLogs = {
  params: Joi.object().keys({
    entityType: Joi.string().required(),
    entityId: Joi.number().required().positive(),
  }),
  query: Joi.object().keys({
    action: Joi.string().valid(...Object.values(AuditActionType)),
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc'),
  }),
};

const getUserAuditLogs = {
  params: Joi.object().keys({
    userId: Joi.number().required().positive(),
  }),
  query: Joi.object().keys({
    action: Joi.string().valid(...Object.values(AuditActionType)),
    entityType: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc'),
  }),
};

export default {
  getAuditLogs,
  getEntityAuditLogs,
  getUserAuditLogs,
};
