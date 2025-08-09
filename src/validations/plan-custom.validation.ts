import Joi from 'joi';

const updateCustomPlan = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    requestedCredits: Joi.number().min(1),
    requestedBrands: Joi.number().min(1),
    durationMonths: Joi.number().min(1),
  }),
  query: Joi.object().keys({
    status: Joi.string().custom((value, helpers) => {
      const statuses = value.split(',');
      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'PAYMENT_PENDING'];
      const isValid = statuses.every((status: string) => validStatuses.includes(status));
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

const updateCustomPlanStatus = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED', 'PAYMENT_PENDING').required(),
  }),
};

export default {
  updateCustomPlan,
  updateCustomPlanStatus,
};
