import Joi from 'joi';

const createReferral = {
  body: Joi.object().keys({
    referrerId: Joi.string().required(),
    referredEmail: Joi.string().email().required(),
    creditAmount: Joi.number().integer().min(1).optional(),
    expiresInDays: Joi.number().integer().min(1).max(365).optional(),
    locale: Joi.object({
      language: Joi.string()
        .valid('en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ar')
        .optional(),
      currency: Joi.string().length(3).optional(),
      timezone: Joi.string().optional(),
      dateFormat: Joi.string().optional(),
      numberFormat: Joi.string().optional(),
    }).optional(),
  }),
};

const getReferralStats = {
  params: Joi.object().keys({
    userId: Joi.number().integer().required(),
  }),
};

const generateReferralLink = {
  params: Joi.object().keys({
    userId: Joi.number().integer().required(),
  }),
  body: Joi.object().keys({
    baseUrl: Joi.string().uri().required(),
    locale: Joi.object({
      language: Joi.string()
        .valid('en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ar')
        .optional(),
      currency: Joi.string().length(3).optional(),
      timezone: Joi.string().optional(),
      dateFormat: Joi.string().optional(),
      numberFormat: Joi.string().optional(),
    }).optional(),
  }),
};

const trackReferralClick = {
  params: Joi.object().keys({
    referralCode: Joi.string().required(),
  }),
  body: Joi.object().keys({
    ipAddress: Joi.string().ip().required(),
    userAgent: Joi.string().optional(),
    location: Joi.string().optional(),
  }),
};

const completeReferral = {
  params: Joi.object().keys({
    referralLink: Joi.string().required(),
  }),
  body: Joi.object().keys({
    newClientId: Joi.number().integer().required(),
  }),
};

const updateReferralSettings = {
  body: Joi.object().keys({
    creditPerReferral: Joi.number().integer().min(1).max(1000).required(),
    expirationDays: Joi.number().integer().min(1).max(365).required(),
    minPurchaseRequired: Joi.boolean().required(),
    bonusOnFirstPurchase: Joi.number().integer().min(0).max(1000).required(),
  }),
};

const getReferralSettings = {
  query: Joi.object().keys({}),
};

const getReferralAnalytics = {
  params: Joi.object().keys({
    referralId: Joi.number().integer().required(),
  }),
  query: Joi.object().keys({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    groupBy: Joi.string().valid('day', 'week', 'month').optional(),
  }),
};

const createReferralCredit = {
  body: Joi.object().keys({
    referrerId: Joi.number().integer().required(),
    referredEmail: Joi.string().email().required(),
    creditAmount: Joi.number().integer().min(1).max(1000).optional(),
    expiresInDays: Joi.number().integer().min(1).max(365).optional(),
    locale: Joi.object({
      language: Joi.string()
        .valid('en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ar')
        .optional(),
      currency: Joi.string().length(3).optional(),
      timezone: Joi.string().optional(),
      dateFormat: Joi.string().optional(),
      numberFormat: Joi.string().optional(),
    }).optional(),
  }),
};

const processReferralReward = {
  params: Joi.object().keys({
    referralId: Joi.number().integer().required(),
  }),
};

const getReferralFraudScore = {
  params: Joi.object().keys({
    referralId: Joi.number().integer().required(),
  }),
};

export default {
  createReferral,
  getReferralStats,
  generateReferralLink,
  trackReferralClick,
  completeReferral,
  updateReferralSettings,
  getReferralSettings,
  getReferralAnalytics,
  createReferralCredit,
  processReferralReward,
  getReferralFraudScore,
};
