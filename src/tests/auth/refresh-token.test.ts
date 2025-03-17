import { UserModel } from '../../models';
import { sign } from 'jsonwebtoken';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { app } from '../../app';
import { config } from '../../config/config';
import { createAndLoginTestUser, TokenPayload } from '../../utils';

describe('AUTH ROUTES - POST /auth/refreshToken', () => {
  it('should refresh tokens for a valid refresh token', async () => {
    const { refreshToken } = await createAndLoginTestUser();

    const response = await supertest(app).post('/auth/refreshToken').set('Cookie', refreshToken);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('refreshToken')]),
    );
    expect(response.body).toHaveProperty('accessToken');
  });

  it('should return an error for an unauthorized', async () => {
    const response = await supertest(app).post('/auth/refreshToken');

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.body.error).toContain('No refresh token provided');
  });

  it('should return an error for an invalid refresh token', async () => {
    const response = await supertest(app)
      .post('/auth/refreshToken')
      .set('Cookie', 'refreshToken=invalidtoken');

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.body.error).toContain('Invalid token');
  });

  it('should return an error for token not found', async () => {
    const { userId } = await createAndLoginTestUser();

    const refreshToken: string = sign({ userId } as TokenPayload, config.jwt.refreshTokenSecret);

    const response = await supertest(app)
      .post('/auth/refreshToken')
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
      .post('/auth/refreshToken')
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('should return 500 Internal Server Error on failure', async () => {
    const { refreshToken } = await createAndLoginTestUser();

    jest.spyOn(UserModel, 'findById').mockRejectedValue(new Error('Internal Server Error'));

    const response = await supertest(app).post('/auth/refreshToken').set('Cookie', refreshToken);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
