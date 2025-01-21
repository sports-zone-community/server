import { BaseError, ErrorProps } from './base.error';
import { StatusCodes } from 'http-status-codes';

export class NotFoundError extends BaseError {
  constructor(message: string, props: ErrorProps) {
    super(StatusCodes.NOT_FOUND, message, props);
  }
}
