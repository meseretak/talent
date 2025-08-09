import Joi from 'joi';

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    description: Joi.string().allow('', null),
    color: Joi.string()
      .pattern(/^#[0-9A-Fa-f]{6}$/)
      .message('Color must be a valid hex color code (e.g., #FF0000)'),
    isActive: Joi.boolean(),
  }),
};

const getCategory = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const updateCategory = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      description: Joi.string().allow('', null),
      color: Joi.string()
        .pattern(/^#[0-9A-Fa-f]{6}$/)
        .message('Color must be a valid hex color code (e.g., #FF0000)'),
      isActive: Joi.boolean(),
    })
    .min(1),
};

const deleteCategory = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const listCategories = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    search: Joi.string().allow('', null),
    includeInactive: Joi.boolean(),
  }),
};

const deactivateCategory = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

export default {
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  listCategories,
  deactivateCategory,
};
