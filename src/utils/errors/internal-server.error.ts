import { BaseError, ErrorProps } from './base.error';
import { StatusCodes } from 'http-status-codes';

export class InternalServerError extends BaseError {
  constructor(message: string, props: ErrorProps) {
    super(StatusCodes.INTERNAL_SERVER_ERROR, message, props);
  }
}
