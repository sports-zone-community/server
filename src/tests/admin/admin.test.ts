import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import mongoose from 'mongoose';
import { createAndLoginTestUser } from '../../utils';

describe('Admin Controller - DELETE /admin/delete-all', () => {
  let accessToken: string;

  beforeEach(async () => {
    const user = await createAndLoginTestUser();
    accessToken = user.accessToken;
  });

  it('should clear all collections and return 200', async () => {
    const response = await supertest(app)
      .delete('/admin/delete-all')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.message).toBe('All collections cleared');

    const collections = await mongoose.connection.db!.collections();
    for (const collection of collections) {
      const count = await collection.countDocuments();
      expect(count).toBe(0);
    }
  });
});
