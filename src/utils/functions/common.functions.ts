import { NotFoundError } from '../errors';
import { Document } from 'mongoose';

export const assertExists = <T extends Document>(document: T | null, docType: string): T => {
  if (!document) {
    throw new NotFoundError(`${docType} not found`);
  }

  return document;
};
