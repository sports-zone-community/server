import { BaseError, ErrorProps } from './base.error';
import { StatusCodes } from 'http-status-codes';

export class UnauthorizedError extends BaseError {
  constructor(message: string, props: ErrorProps) {
    super(StatusCodes.UNAUTHORIZED, message, props);
  }
}
