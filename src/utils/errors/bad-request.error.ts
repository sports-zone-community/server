import { BaseError, ErrorProps } from './base.error';
import { StatusCodes } from 'http-status-codes';

export class BadRequestError extends BaseError {
  constructor(message: string, props: ErrorProps) {
    super(StatusCodes.BAD_REQUEST, message, props);
  }
}
