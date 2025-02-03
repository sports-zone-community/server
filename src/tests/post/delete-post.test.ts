import { StatusCodes } from 'http-status-codes';
import { PostModel } from '../../models';
import {
  testLogin,
  testRegister,
  validMockLogin,
  validMockRegister,
} from '../auth/auth-test.utils';
import { testCreatePost, testDeletePost, validMockPost } from './post-test.utils';
import { fakeObjectId } from '../common-test.utils';

describe('DELETE ROUTES - DELETE /posts/:id', () => {
  let accessToken: string;
  let postId: string;

  beforeEach(async () => {
    await testRegister(validMockRegister);

    accessToken = (await testLogin(validMockLogin)).body.accessToken;
    postId = (await testCreatePost(validMockPost, accessToken)).body._id;
  });

  it('should delete a post by ID', async () => {
    const response = await testDeletePost(postId, accessToken);

    expect(response.status).toBe(StatusCodes.OK);

    const post = await PostModel.findById(postId);
    expect(post).toBeNull();
  });

  it('should return a not found error if post ID does not exist', async () => {
    const response = await testDeletePost(fakeObjectId, accessToken);

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('should return an error if the user is not authenticated', async () => {
    const response = await testDeletePost(postId, 'invalid-token');

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should return a forbidden error if the user tries to delete a post that is not his', async () => {
    const otherUserEmail = 'other-user@gmail.com';
    const otherUsername = 'other-username';
    await testRegister({ ...validMockRegister, email: otherUserEmail, username: otherUsername });
    const otherUserAccessToken = (await testLogin({ ...validMockLogin, email: otherUserEmail })).body.accessToken;

    const response = await testDeletePost(postId, otherUserAccessToken);

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
  });

  it('should return 500 Internal Server Error on failure', async () => {
    jest
      .spyOn(PostModel, 'findByIdAndDelete')
      .mockRejectedValue(new Error('Internal Server Error'));

    const response = await testDeletePost(postId, accessToken);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
