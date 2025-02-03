import { StatusCodes } from 'http-status-codes';
import { UserModel } from '../../models';
import { createAndLoginTestUser, testVerifyToken, validMockRegister } from './auth-test.utils';

describe('AUTH ROUTES - POST /auth/verify', () => {
  it('should verify user', async () => {
    const { accessToken } = await createAndLoginTestUser(validMockRegister);

    const response = await testVerifyToken(accessToken);

    expect(response.status).toBe(StatusCodes.OK);
  });

  it('should return user not found', async () => {
    const { accessToken } = await createAndLoginTestUser(validMockRegister);
    jest.spyOn(UserModel, 'findById').mockResolvedValue(null);

    const response = await testVerifyToken(accessToken);

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(response.body.error).toContain('User not found');
  });
});
