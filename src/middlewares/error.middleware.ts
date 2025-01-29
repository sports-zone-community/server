import { NextFunction, Request, Response } from 'express';
import { BaseError } from '../utils/errors/base.error';
import { StatusCodes } from 'http-status-codes';

// TODO: Upgrade express to ^5.0.0 and types for better error middleware
export const errorMiddleware = (
  err: BaseError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof BaseError) {
    res.status(err.status).json({ error: `[${err.constructor.name}]: ${err.message}` });
  } else {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: `[InternalServerError]: ${err.message}` });
  }
};
