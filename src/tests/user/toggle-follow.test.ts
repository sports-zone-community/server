import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import {
  createAndLoginTestUser,
  validMockRegister,
  otherValidMockRegister,
} from '../auth/auth-test.utils';
import { testToggleFollow } from './user-test.utils';
import { UserModel } from '../../models';

describe('POST /users/toggle-follow/:id', () => {
  let accessToken: string;
  let userId: string;
  let otherUserId: string;

  beforeEach(async () => {
    const user = await createAndLoginTestUser(validMockRegister);
    accessToken = user.accessToken;
    userId = user.userId;
    otherUserId = (await createAndLoginTestUser(otherValidMockRegister)).userId;
  });

  it('should follow a user', async () => {
    const response = await testToggleFollow(otherUserId, accessToken);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.following[0]).toBe(otherUserId.toString());
  });

  it('should unfollow a user', async () => {
    await testToggleFollow(otherUserId, accessToken);

    const response = await testToggleFollow(otherUserId, accessToken);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.following.length).toBe(0);
  });

  it('should return an error if the user ID is invalid', async () => {
    const response = await testToggleFollow('invalid-id', accessToken);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).toHaveProperty('error');
  });

  it('should return an error if the user is not authenticated', async () => {
    const response = await supertest(app).post(`/users/toggle-follow/${otherUserId}`);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should return 500 Internal Server Error on failure', async () => {
    jest.spyOn(UserModel, 'findById').mockRejectedValue(new Error('Internal Server Error'));

    const response = await testToggleFollow(otherUserId, accessToken);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it('should return an error if the user tries to follow themselves', async () => {
    const response = await testToggleFollow(userId, accessToken);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });
});
