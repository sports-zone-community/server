import { StatusCodes } from 'http-status-codes';
import { UserModel } from '../../models';
import { testRegister, invalidMockRegister, validMockRegister } from './auth-test.utils';

describe('AUTH ROUTES - POST /auth/register', () => {
  it('should register a new user', async () => {
    const response = await testRegister(validMockRegister);

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body.message).toBe('User registered successfully');
  });

  it('should return an error if a required field is missing', async () => {
    const response = await testRegister(invalidMockRegister);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should return an error if the user already exists', async () => {
    await testRegister(validMockRegister);
    const response = await testRegister(validMockRegister);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it('should return 500 Internal Server Error on failure', async () => {
    jest.spyOn(UserModel, 'create').mockRejectedValue(new Error('Internal Server Error'));

    const response = await testRegister(validMockRegister);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
