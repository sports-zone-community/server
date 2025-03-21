import supertest, { Response } from 'supertest';
import { app } from '../app';
import { UserModel } from '../models';

export const mockPopulateMock = () => {
  return { populate: mockPopulateMock };
};

export const createAndLoginTestUser = async (
  email = 'test@example.com',
): Promise<{ accessToken: string; refreshToken: string; userId: string }> => {
  await createTestUser(email);

  const response = await testLogin(email, 'password123');

  const user = await UserModel.findOne({ email });
  const refreshToken = response.header['set-cookie'][0].split(';')[0];

  return {
    accessToken: response.body.accessToken,
    refreshToken: refreshToken ?? '',
    userId: user?._id as string,
  };
};

export const createTestUser = async (email = 'test@example.com') => {
  const mockUserRequest = {
    email,
    password: 'password123',
    username: email.split('@')[0],
    name: 'Test User',
  };
  return await supertest(app).post('/auth/register').send(mockUserRequest);
};

export const testLogin = async (
  email = 'test@example.com',
  password = 'password123',
): Promise<Response> => {
  return supertest(app).post('/auth/login').send({ email, password });
};
