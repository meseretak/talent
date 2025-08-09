import Joi from 'joi';
import { PaymentMethodType, PaymentStatusType } from '../generated/prisma';

const createPaymentInformation = {
  body: Joi.object().keys({
    bankAccountNumber: Joi.string().required(),
    bankAccountName: Joi.string().required(),
    bankName: Joi.string().required(),
    accountType: Joi.string().required().valid('CHECKING', 'SAVINGS'),
  }),
};

const createInvoice = {
  body: Joi.object().keys({
    projectId: Joi.number().required().positive(),
    freelancerId: Joi.number().required().positive(),
    amount: Joi.number().required().positive(),
    description: Joi.string().required().min(10),
    dueDate: Joi.date().required().greater('now'),
  }),
};

const updatePaymentStatus = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    status: Joi.string()
      .required()
      .valid(...Object.values(PaymentStatusType)),
  }),
};

const getPayment = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

const getFreelancerPayments = {
  params: Joi.object().keys({
    freelancerId: Joi.number().required().positive(),
  }),
  query: Joi.object().keys({
    status: Joi.string().custom((value, helpers) => {
      const statuses = value.split(',');
      const validStatuses = Object.values(PaymentStatusType);
      const isValid = statuses.every((status: string) =>
        validStatuses.includes(status as PaymentStatusType),
      );
      if (!isValid) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc'),
  }),
};

const getClientPayments = {
  params: Joi.object().keys({
    clientId: Joi.number().required().positive(),
  }),
  query: Joi.object().keys({
    status: Joi.string().custom((value, helpers) => {
      const statuses = value.split(',');
      const validStatuses = Object.values(PaymentStatusType);
      const isValid = statuses.every((status: string) =>
        validStatuses.includes(status as PaymentStatusType),
      );
      if (!isValid) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc'),
  }),
};

const processPayment = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    method: Joi.string()
      .required()
      .valid(...Object.values(PaymentMethodType)),
    transactionDetails: Joi.string().required(),
  }),
};

const generatePaymentReport = {
  query: Joi.object().keys({
    startDate: Joi.date().required(),
    endDate: Joi.date().required().min(Joi.ref('startDate')),
    freelancerId: Joi.number().positive(),
    clientId: Joi.number().positive(),
    status: Joi.string().custom((value, helpers) => {
      const statuses = value.split(',');
      const validStatuses = Object.values(PaymentStatusType);
      const isValid = statuses.every((status: string) =>
        validStatuses.includes(status as PaymentStatusType),
      );
      if (!isValid) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
  }),
};

// New subscription validation schemas
const createSubscription = {
  body: Joi.object().keys({
    clientId: Joi.number().required().positive(),
    planId: Joi.string().required(),
    priceId: Joi.string(),
    customCredits: Joi.number().positive(),
    paymentMethod: Joi.string()
      .required()
      .valid(...Object.values(PaymentMethodType)),
  }),
};

const getSubscription = {
  params: Joi.object().keys({
    subscriptionId: Joi.string().required(),
  }),
};

const renewSubscription = {
  params: Joi.object().keys({
    subscriptionId: Joi.string().required(),
  }),
};

const cancelSubscription = {
  params: Joi.object().keys({
    subscriptionId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    reason: Joi.string(),
  }),
};

const changePlan = {
  params: Joi.object().keys({
    subscriptionId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    newPlanId: Joi.string().required(),
    newPriceId: Joi.string(),
    reason: Joi.string(),
    prorated: Joi.boolean(),
  }),
};

const processSubscriptionPayment = {
  params: Joi.object().keys({
    invoiceId: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    paymentMethod: Joi.string()
      .required()
      .valid(...Object.values(PaymentMethodType)),
    transactionDetails: Joi.string().required(),
    amount: Joi.number().positive(),
  }),
};

const getClientSubscription = {
  params: Joi.object().keys({
    clientId: Joi.number().required().positive(),
  }),
};

const getSubscriptionUsage = {
  params: Joi.object().keys({
    subscriptionId: Joi.string().required(),
  }),
};

export default {
  createPaymentInformation,
  createInvoice,
  updatePaymentStatus,
  getPayment,
  getFreelancerPayments,
  getClientPayments,
  processPayment,
  generatePaymentReport,
  // Add new subscription validation schemas
  createSubscription,
  getSubscription,
  renewSubscription,
  cancelSubscription,
  changePlan,
  processSubscriptionPayment,
  getClientSubscription,
  getSubscriptionUsage,
};
