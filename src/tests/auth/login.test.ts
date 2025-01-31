import { UserModel } from '../../models';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import { createTestUser, testLogin } from '../../utils';

describe('AUTH ROUTES - POST /auth/login', () => {
  it('should log in a user with valid credentials', async () => {
    await createTestUser();
    const response = await testLogin();

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('should log in again to update refresh token', async () => {
    await createTestUser();
    await testLogin();
    const response = await testLogin();

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('should return an error for missing credentials', async () => {
    const response = await supertest(app).post('/auth/login').send({
      username: 'testuser',
      password: 'password123',
    });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should return an error for user does not exists', async () => {
    const response = await supertest(app).post('/auth/login').send({
      email: 'notexists@gmail.com',
      password: 'password123',
    });

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('should return an error for invalid credentials', async () => {
    await createTestUser();

    const response = await supertest(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'invalidpassword',
    });

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.body.error).toContain('Invalid credentials');
  });

  it('should return 500 Internal Server Error on failure', async () => {
    const mockUserRequest = {
      email: 'test@example.com',
      password: 'password123',
    };

    jest.spyOn(UserModel, 'findOne').mockRejectedValue(new Error('Internal Server Error'));

    const response = await supertest(app).post('/auth/login').send(mockUserRequest);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
