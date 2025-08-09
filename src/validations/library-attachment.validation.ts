import Joi from 'joi';
import { LibAttachmentType } from '../generated/prisma';

const createAttachment = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    size: Joi.number().required(),
    type: Joi.string()
      .valid(...Object.values(LibAttachmentType))
      .required(),
    url: Joi.string().uri().required(),
    resourceId: Joi.string().required(),
    description: Joi.string(),
  }),
};

const getResourceAttachments = {
  params: Joi.object().keys({
    resourceId: Joi.string().required(),
  }),
};

const getAttachment = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const updateAttachment = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string(),
    })
    .min(1),
};

const deleteAttachment = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

export default {
  createAttachment,
  getResourceAttachments,
  getAttachment,
  updateAttachment,
  deleteAttachment,
};
