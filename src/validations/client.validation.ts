import Joi from 'joi';
import { ClientType } from '../generated/prisma';

const createClient = {
  body: Joi.object().keys({
    userId: Joi.number().integer(),
    companyName: Joi.string().optional(),
    companyWebsite: Joi.string().uri().optional(),
    billingAddress: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      postalCode: Joi.string().optional(),
      country: Joi.string().optional(),
    }).optional(),
    contactPerson: Joi.object({
      fullName: Joi.string().required(),
      email: Joi.string().email().required(),
      phoneNumber: Joi.string().optional(),
      position: Joi.string().optional(),
    }),
    clientType: Joi.string()
      .valid(...Object.values(ClientType))
      .required(),
  }),
};

const getClient = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

const updateClient = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
  body: Joi.object({
    companyName: Joi.string().optional(),
    companyWebsite: Joi.string().uri().optional(),
    billingAddress: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      postalCode: Joi.string().optional(),
      country: Joi.string().optional(),
    }).optional(),
    contactPerson: Joi.object({
      fullName: Joi.string().optional(),
      email: Joi.string().email().optional(),
      phoneNumber: Joi.string().optional(),
      position: Joi.string().optional(),
    }).optional(),
    defaultPaymentMethod: Joi.string().optional(),
    taxExempt: Joi.boolean().optional(),
    taxId: Joi.string().optional(),
  }).unknown(true),
};

const getAllClients = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    search: Joi.string(),
    sortBy: Joi.string().valid('companyName', 'createdAt', 'updatedAt'),
    sortOrder: Joi.string().valid('asc', 'desc'),
    clientType: Joi.string().valid(...Object.values(ClientType)),
  }),
};

const deleteClient = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

const getClientStats = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

const getClientProjects = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
  query: Joi.object().keys({
    status: Joi.string(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc'),
  }),
};

export default {
  createClient,
  getClient,
  updateClient,
  getAllClients,
  deleteClient,
  getClientStats,
  getClientProjects,
};
