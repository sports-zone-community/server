import { StatusCodes } from 'http-status-codes';
import { PostModel } from '../../models';
import {
  createAndLoginTestUser,
  otherValidMockRegister,
  validMockRegister,
} from '../auth/auth-test.utils';
import {
  testCreatePost,
  testUpdatePost,
  validMockPost,
  validMockUpdatePost,
  invalidMockUpdatePost,
} from './post-test.utils';
import { fakeObjectId } from '../common-test.utils';

describe('POST ROUTES - PUT /posts/:id', () => {
  let accessToken: string;
  let postId: string;

  beforeEach(async () => {
    accessToken = (await createAndLoginTestUser(validMockRegister)).accessToken;
    postId = (await testCreatePost(validMockPost, accessToken)).body._id;
  });

  it('should update a post by ID', async () => {
    const response = await testUpdatePost(postId, validMockUpdatePost, accessToken);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body._id).toBe(postId);
    expect(response.body.image).toBe(validMockUpdatePost.image);
    expect(response.body.content).toBe(validMockUpdatePost.content);
  });

  it('should return a not found error if post ID does not exist', async () => {
    const response = await testUpdatePost(fakeObjectId, validMockUpdatePost, accessToken);

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('should return an error if the user is not authenticated', async () => {
    const response = await testUpdatePost(postId, validMockUpdatePost, 'invalid-token');

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should return a forbidden error if the user tries to update a post that is not his', async () => {
    const otherUserAccessToken: string = (await createAndLoginTestUser(otherValidMockRegister))
      .accessToken;

    const response = await testUpdatePost(postId, validMockUpdatePost, otherUserAccessToken);

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
  });

  it('should return 500 Internal Server Error on failure', async () => {
    jest
      .spyOn(PostModel, 'findByIdAndUpdate')
      .mockRejectedValue(new Error('Internal Server Error'));

    const response = await testUpdatePost(postId, validMockUpdatePost, accessToken);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it('should return a bad request error if the update post object is invalid', async () => {
    const response = await testUpdatePost(postId, invalidMockUpdatePost, accessToken);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });
});
