import { StatusCodes } from 'http-status-codes';
import { PostModel } from '../../models';
import { createAndLoginTestUser, validMockRegister } from '../auth/auth-test.utils';
import { testCreatePost, testToggleLike, validMockPost } from './post-test.utils';
import { fakeObjectId } from '../common-test.utils';

describe('POST ROUTES - POST /posts/:id/like', () => {
  let accessToken: string;
  let postId: string;

  beforeEach(async () => {
    accessToken = (await createAndLoginTestUser(validMockRegister)).accessToken;
    postId = (await testCreatePost(validMockPost, accessToken)).body._id;
  });

  it('should toggle like on a post by ID', async () => {
    const response = await testToggleLike(postId, accessToken);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.likes).toBeInstanceOf(Array);
    expect(response.body.likes.length).toBe(1);

    const response2 = await testToggleLike(postId, accessToken);

    expect(response2.status).toBe(StatusCodes.OK);
    expect(response2.body.likes).toBeInstanceOf(Array);
    expect(response2.body.likes.length).toBe(0);
  });

  it('should return a not found error if post ID does not exist', async () => {
    const response = await testToggleLike(fakeObjectId, accessToken);

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('should return an error if the user is not authenticated', async () => {
    const response = await testToggleLike(postId, 'invalid-token');

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should return 500 Internal Server Error on failure', async () => {
    jest
      .spyOn(PostModel, 'findByIdAndUpdate')
      .mockRejectedValue(new Error('Internal Server Error'));

    const response = await testToggleLike(postId, accessToken);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
