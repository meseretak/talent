import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import Joi from 'joi';
import ApiError from '../utils/ApiError';
import pick from '../utils/pick';

const validate = (schema: object) => (req: Request, res: Response, next: NextFunction) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const obj = pick(req, Object.keys(validSchema));

  console.log('Validation schema:', validSchema);
  console.log('Request body:', req.body);
  console.log('Picked object:', obj);

  // Handle empty body special case for PATCH requests
  if (req.method === 'PATCH' && (!req.body || Object.keys(req.body).length === 0)) {
    if (validSchema.body && (validSchema.body as Joi.ObjectSchema).describe().keys) {
      return next(new ApiError(httpStatus.BAD_REQUEST, 'Request body cannot be empty for update'));
    }
  }

  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(obj);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
  Object.assign(req, value);
  return next();
};

export default validate;
