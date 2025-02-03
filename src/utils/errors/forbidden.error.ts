import { BaseError } from './base.error';
import { StatusCodes } from 'http-status-codes';

export class ForbiddenError extends BaseError {
  constructor(message: string) {
    super(StatusCodes.FORBIDDEN, message);
  }
}
