import { NextFunction, Request, Response } from 'express';
import { BaseError } from '../utils/errors/base.error';
import { logError } from '../utils';
import { StatusCodes } from 'http-status-codes';

export const errorMiddleware = (
  err: BaseError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.log('typeof err: ', typeof err);
  if (err instanceof BaseError) {
    logError(err.message, err.props.functionName);
    res.status(err.status).json({ error: `[${err.constructor.name}]: ${err.message}` });
  } else {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: `[InternalServerError]: ${err.message}` });
  }
};
