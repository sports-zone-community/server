import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import { createAndLoginTestUser, validMockRegister } from '../auth/auth-test.utils';
import { CommentModel } from '../../models';
import { testCreatePost, validMockPost } from '../post/post-test.utils';
import { testCreateComment } from './comment-test.utils';
import { getObjectId } from '../../utils';

describe('GET /comments', () => {
  let accessToken: string;
  let postId: string;

  beforeEach(async () => {
    accessToken = (await createAndLoginTestUser(validMockRegister)).accessToken;
    const postResponse = await testCreatePost(validMockPost, accessToken);
    postId = postResponse.body._id.toString();
    await CommentModel.deleteMany({});
  });

  it('should return comments for a given post ID', async () => {
    const commentResponse = await testCreateComment(
      { content: 'Test Comment', postId: getObjectId(postId) },
      accessToken,
    );

    const response = await supertest(app)
      .get('/comments')
      .query({ postId })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
    expect(response.body[0]._id).toBe(commentResponse.body._id);
  });

  it('should return an empty array if no comments are found', async () => {
    const response = await supertest(app)
      .get('/comments')
      .query({ postId })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(0);
  });

  it('should return an error if the postId is invalid', async () => {
    const response = await supertest(app)
      .get('/comments')
      .query({ postId: 'invalid-id' })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).toHaveProperty('error');
  });

  it('should return an error if the user is not authenticated', async () => {
    const response = await supertest(app).get('/comments').query({ postId });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should return 500 Internal Server Error on failure', async () => {
    jest.spyOn(CommentModel, 'find').mockRejectedValue(new Error('Internal Server Error'));

    const response = await supertest(app)
      .get('/comments')
      .query({ postId })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
