import { Request, Response } from 'express';
import mongoose from 'mongoose';

export const deleteAllCollections = async (req: Request, res: Response) => {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error('No DB connections');
  }

  const collections = await db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }

  res.status(200).json({ message: 'All collections cleared' });
};
