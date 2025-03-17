import { UserModel } from '../../models';
import { sign } from 'jsonwebtoken';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { app } from '../../app';
import { config } from '../../config/config';
import { createAndLoginTestUser, TokenPayload } from '../../utils';

describe('AUTH ROUTES - POST /auth/logout', () => {
  it('should log out a user with a valid token', async () => {
    const { accessToken, refreshToken } = await createAndLoginTestUser();

    const response = await supertest(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', refreshToken);

    expect(response.status).toBe(200);
    expect(response.text).toBe('User logged out successfully');
  });

  it('should return unauthorized for not providing token', async () => {
    const response = await supertest(app).post('/auth/logout');

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should return unauthorized for invalid token', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();
    const refreshToken = sign({ id: fakeUserId }, config.jwt.refreshTokenSecret);

    const response = await supertest(app).post('/auth/logout').set('Cookie', refreshToken);

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should return an error for token not found', async () => {
    const { userId } = await createAndLoginTestUser();

    const refreshToken: string = sign({ userId } as TokenPayload, config.jwt.refreshTokenSecret);

    const response = await supertest(app)
      .post('/auth/logout')
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should return an error for user not found', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();

    const refreshToken: string = sign(
      { userId: fakeUserId.toString() } as TokenPayload,
      config.jwt.refreshTokenSecret,
    );

    const response = await supertest(app)
      .post('/auth/logout')
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('should return 500 Internal Server Error on failure', async () => {
    const { refreshToken } = await createAndLoginTestUser();

    jest.spyOn(UserModel, 'findById').mockRejectedValue(new Error('Internal Server Error'));

    const response = await supertest(app).post('/auth/logout').set('Cookie', refreshToken);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
