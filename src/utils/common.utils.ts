import { NotFoundError } from './errors';
import { Document, Types } from 'mongoose';

export const assertExists = <T extends Document>(document: T | null, docType: string): T => {
  if (!document) {
    throw new NotFoundError(`${docType} not found`);
  }

  return document;
};

export const getObjectId = (id: string): Types.ObjectId => new Types.ObjectId(id);
