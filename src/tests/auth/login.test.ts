import { UserModel } from '../../models';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import {
  testRegister,
  invalidMockLogin,
  testLogin,
  validMockLogin,
  validMockRegister,
} from './auth-test.utils';

describe('AUTH ROUTES - POST /auth/login', () => {
  it('should log in a user with valid credentials', async () => {
    await testRegister(validMockRegister);
    const response = await testLogin(validMockLogin);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('should log in again to update refresh token', async () => {
    await testRegister(validMockRegister);
    await testLogin(validMockLogin);
    const response = await testLogin(validMockLogin);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('should return an error for missing credentials', async () => {
    const response = await testLogin(invalidMockLogin);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should return an error for user does not exists', async () => {
    const response = await testLogin(validMockLogin);

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('should return an error for invalid credentials', async () => {
    await testRegister(validMockRegister);

    const response = await supertest(app)
      .post('/auth/login')
      .send({ ...validMockLogin, password: 'invalid-password' });

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.body.error).toContain('Invalid credentials');
  });

  it('should return 500 Internal Server Error on failure', async () => {
    jest.spyOn(UserModel, 'findOne').mockRejectedValue(new Error('Internal Server Error'));

    const response = await supertest(app).post('/auth/login').send(validMockLogin);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
