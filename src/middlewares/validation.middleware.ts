import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../utils';

interface RequestSchemas {
  bodySchema?: Joi.Schema;
  paramsSchema?: Joi.Schema;
  querySchema?: Joi.Schema;
}

export const validationMiddleware = (schemas: RequestSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { bodySchema, paramsSchema, querySchema } = schemas;

    bodySchema && validateSchema(bodySchema, req.body);
    paramsSchema && validateSchema(paramsSchema, req.params);
    querySchema && validateSchema(querySchema, req.query);

    next();
  };
};

export const validateSchema = <T>(schema: Joi.Schema<T>, input: T) => {
  const { error }: Joi.ValidationResult = schema.validate(input);

  if (error) {
    throw new BadRequestError(error.message);
  }
};
