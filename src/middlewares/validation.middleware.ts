import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../utils';

interface RequestSchemas {
  bodySchema?: Joi.Schema;
  paramsSchema?: Joi.Schema;
}

// TODO: FIX THIS
export const validationMiddleware =
  (schemas: RequestSchemas) => (req: Request, res: Response, next: NextFunction) => {
    const { bodySchema, paramsSchema } = schemas;

    if (bodySchema) {
      return validateSchema(bodySchema, req.body, next);
    }

    if (paramsSchema) {
      return validateSchema(paramsSchema, req.params, next);
    }
  };

const validateSchema = <T>(schema: Joi.Schema<T>, input: T, next: NextFunction) => {
  const { error }: Joi.ValidationResult = schema.validate(input);
  return next(error && new BadRequestError(error.message));
};
