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
      const { error }: Joi.ValidationResult = bodySchema.validate(req.body);
      next(error && new BadRequestError(error.message));
    }

    if (paramsSchema) {
      const { error }: Joi.ValidationResult = paramsSchema.validate(req.params);
      next(error && new BadRequestError(error.message));
    }
  };
