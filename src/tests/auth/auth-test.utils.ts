import supertest from 'supertest';
import { app } from '../../app';
import { UserDocument, UserModel } from '../../models';
import { LoginObject, RegisterObject } from '../../validations';
import { assertExists } from '../../utils';

export const fakeAccessToken: string = 'fake-access-token';

export const validMockLogin: LoginObject = { email: 'test@example.com', password: 'password123' };

export const invalidMockLogin: Partial<LoginObject> = { email: validMockLogin.email };

export const validMockRegister: RegisterObject = {
  email: validMockLogin.email,
  password: validMockLogin.password,
  name: 'Test User',
  username: 'testuser',
};

export const invalidMockRegister: Partial<RegisterObject> = { email: validMockRegister.email };

export const mockPopulateMock = () => {
  return { populate: mockPopulateMock };
};

export const createAndLoginTestUser = async (
  mockRegister: Partial<RegisterObject>,
): Promise<{ accessToken: string; refreshToken: string; userId: string }> => {
  await testRegister(mockRegister);
  const response = await testLogin({ email: mockRegister.email, password: mockRegister.password });

  const user: UserDocument = assertExists(
    (await UserModel.findOne({ email: mockRegister.email })) as UserDocument,
    'User',
  );
  return {
    accessToken: response.body.accessToken,
    refreshToken: response.body.refreshToken,
    userId: user._id as string,
  };
};

export const testRegister = async (mockRegister: Partial<RegisterObject>) =>
  await supertest(app).post('/auth/register').send(mockRegister);

export const testLogin = async (mockLogin: Partial<LoginObject>) =>
  await supertest(app).post('/auth/login').send(mockLogin);

export const testLogout = async (refreshToken: string) =>
  await supertest(app).post('/auth/logout').set('Authorization', `Bearer ${refreshToken}`);

export const testRefreshToken = async (refreshToken: string) =>
  await supertest(app).post('/auth/refreshToken').set('Authorization', `Bearer ${refreshToken}`);

export const testVerifyToken = async (accessToken: string) =>
  await supertest(app).get('/auth/verify').set('Authorization', `Bearer ${accessToken}`);
