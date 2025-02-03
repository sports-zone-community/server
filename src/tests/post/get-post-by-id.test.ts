import { StatusCodes } from 'http-status-codes';
import { testCreatePost, testGetPostById, validMockPost } from './post-test.utils';
import { PostModel } from '../../models';
import { fakeObjectId } from '../common-test.utils';
import {
  createAndLoginTestUser,
  fakeAccessToken,
  validMockRegister,
} from '../auth/auth-test.utils';

describe('GET ROUTES - GET /posts/:id', () => {
  let accessToken: string;
  let postId: string;

  beforeEach(async () => {
    accessToken = (await createAndLoginTestUser(validMockRegister)).accessToken;
    postId = (await testCreatePost(validMockPost, accessToken)).body._id;
  });

  it('should get a post by ID', async () => {
    const response = await testGetPostById(postId, accessToken);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body._id).toBe(postId);
    expect(response.body.image).toBe(validMockPost.image);
    expect(response.body.content).toBe(validMockPost.content);
  });

  it('should return a not found error if post ID does not exist', async () => {
    const response = await testGetPostById(fakeObjectId, accessToken);

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('should return an error if the user is not authenticated', async () => {
    const response = await testGetPostById(postId, fakeAccessToken);

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should return 500 Internal Server Error on failure', async () => {
    jest.spyOn(PostModel, 'findById').mockRejectedValue(new Error('Internal Server Error'));

    const response = await testGetPostById(postId, accessToken);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
