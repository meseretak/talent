import Joi from 'joi';

const uploadFile = {
  body: Joi.object().keys({
    description: Joi.string().optional(),
    storageProvider: Joi.string().optional(),
    bucket: Joi.string().optional(),
    objectType: Joi.string().optional(),
    objectId: Joi.number().optional(),
    metadata: Joi.any().optional(),
  }),
};

export default {
  uploadFile,
};
