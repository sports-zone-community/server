import { UserModel } from '../../models';
import { sign } from 'jsonwebtoken';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { app } from '../../app';
import { config } from '../../config/config';
import { createAndLoginTestUser } from '../../utils';

describe('AUTH ROUTES - POST /auth/logout', () => {
  it('should log out a user with a valid token', async () => {
    const { refreshToken } = await createAndLoginTestUser();

    const response = await supertest(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${refreshToken}`);

    expect(response.status).toBe(200);
    expect(response.text).toBe('User logged out successfully');
  });

  it('should return an error for an invalid request', async () => {
    const response = await supertest(app).post('/auth/logout');

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should return an error for an invalid token', async () => {
    const response = await supertest(app)
      .post('/auth/logout')
      .set('Authorization', 'Bearer invalidtoken');

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should return an error for user not found', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();

    const refreshToken = sign({ id: fakeUserId }, config.jwt.refreshTokenSecret);

    const response = await supertest(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${refreshToken}`);

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('should return an error for token not found', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();
    const user = new UserModel({
      _id: fakeUserId,
      email: 'test@example.com',
      password: 'hashedpassword',
      username: 'testuser',
      name: 'Test User',
      tokens: ['differentToken'],
    });

    await user.save();

    const refreshToken = sign({ id: fakeUserId.toString() }, config.jwt.refreshTokenSecret);

    const response = await supertest(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${refreshToken}`);

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('should return 500 Internal Server Error on failure', async () => {
    const { refreshToken } = await createAndLoginTestUser();

    jest.spyOn(UserModel, 'findById').mockRejectedValue(new Error('Internal Server Error'));

    const response = await supertest(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${refreshToken}`);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
