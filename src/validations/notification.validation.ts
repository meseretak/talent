import Joi from 'joi';

const getNotifications = {
  query: Joi.object().keys({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'readAt').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    read: Joi.boolean(),
    type: Joi.string().valid('PROJECT', 'TASK', 'PAYMENT', 'MESSAGE', 'SYSTEM', 'SECURITY'),
    entityType: Joi.string(),
    entityId: Joi.number().positive(),
  }),
};

const getNotificationById = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

const markAsRead = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

const markManyAsRead = {
  body: Joi.object().keys({
    notificationIds: Joi.array().items(Joi.number().positive()).min(1).required(),
  }),
};

const deleteNotification = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

const trackClick = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

const markAsDelivered = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

export default {
  getNotifications,
  getNotificationById,
  markAsRead,
  markManyAsRead,
  deleteNotification,
  trackClick,
  markAsDelivered,
};
