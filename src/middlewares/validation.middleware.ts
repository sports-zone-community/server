import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../utils';

interface RequestSchemas {
  bodySchema?: Joi.Schema;
  paramsSchema?: Joi.Schema;
}

export const validationMiddleware =
  (schemas: RequestSchemas) => (req: Request, res: Response, next: NextFunction) => {
    const { bodySchema, paramsSchema } = schemas;

    bodySchema && validateSchema(bodySchema, req.body);
    paramsSchema && validateSchema(paramsSchema, req.params);

    next();
  };

const validateSchema = <T>(schema: Joi.Schema<T>, input: T) => {
  const { error }: Joi.ValidationResult = schema.validate(input);

  if (error) {
    throw new BadRequestError(error.message);
  }
};
