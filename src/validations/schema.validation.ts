import Joi from 'joi';
import { BadRequestError } from '../utils';
import { Request } from 'express';

export const validateSchema = <TInput>(schema: Joi.Schema<TInput>, req: Request): TInput => {
  const { value, error } = schema.validate(req.body);

  if (error) {
    throw new BadRequestError(error.message);
  }

  return value;
};
