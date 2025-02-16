import { NotFoundError } from './errors';
import { Document, Types } from 'mongoose';
import fs from 'fs';
import path from 'path';

export const assertExists = <T extends Document>(document: T | null, docType: string): T => {
  if (!document) {
    throw new NotFoundError(`${docType} not found`);
  }

  return document;
};

export const getObjectId = (id: string): Types.ObjectId => new Types.ObjectId(id);

export const deleteFile = (filename: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, '..', '..', filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) return reject('File not found.');

      fs.unlink(filePath, (err) => {
        if (err) return reject('Error deleting file.');
        resolve('File deleted successfully.');
      });
    });
  });
};
