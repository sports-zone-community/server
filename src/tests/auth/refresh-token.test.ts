import { UserModel } from '../../models';
import { sign } from 'jsonwebtoken';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import { config } from '../../config/config';
import {
  createAndLoginTestUser,
  testLogout,
  testRefreshToken,
  validMockRegister,
} from './auth-test.utils';
import { fakeObjectId } from '../common-test.utils';

describe('AUTH ROUTES - POST /auth/refreshToken', () => {
  it('should refresh tokens for a valid refresh token', async () => {
    const { refreshToken } = await createAndLoginTestUser(validMockRegister);

    const response = await testRefreshToken(refreshToken);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('should return an error for an invalid request', async () => {
    const response = await supertest(app).post('/auth/refreshToken');

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should return an error for an invalid token', async () => {
    const response = await testRefreshToken('invalidToken');

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should return an error for user not found', async () => {
    const refreshToken = sign({ id: fakeObjectId }, config.jwt.refreshTokenSecret);

    const response = await testRefreshToken(refreshToken);

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('should return an error for token not found', async () => {
    const { refreshToken } = await createAndLoginTestUser(validMockRegister);
    await testLogout(refreshToken);

    const response = await testRefreshToken(refreshToken);

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should return 500 Internal Server Error on failure', async () => {
    const { refreshToken } = await createAndLoginTestUser(validMockRegister);

    jest.spyOn(UserModel, 'findById').mockRejectedValue(new Error('Internal Server Error'));

    const response = await testRefreshToken(refreshToken);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
