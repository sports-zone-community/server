import { StatusCodes } from 'http-status-codes';
import { PostModel } from '../../models';
import { createAndLoginTestUser, validMockRegister } from '../auth/auth-test.utils';
import { testCreatePost, testGetPostsByUserId, validMockPost } from './post-test.utils';

describe('GET ROUTES - GET /posts/user/:userId', () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = (await createAndLoginTestUser(validMockRegister)).accessToken;

    await testCreatePost(validMockPost, accessToken);
  });

  it('should get posts by user ID', async () => {
    const response = await testGetPostsByUserId(accessToken);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should return an error if the user is not authenticated', async () => {
    const response = await testGetPostsByUserId('invalid-token');

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should return 500 Internal Server Error on failure', async () => {
    jest.spyOn(PostModel, 'find').mockRejectedValue(new Error('Internal Server Error'));

    const response = await testGetPostsByUserId(accessToken);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
