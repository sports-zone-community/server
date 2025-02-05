import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import { createAndLoginTestUser, validMockRegister } from '../auth/auth-test.utils';
import { CommentModel, UserModel } from '../../models';
import { testCreatePost, validMockPost } from '../post/post-test.utils';
import { testCreateComment } from './comment-test.utils';
import { CreateCommentObject } from '../../validations';
import { Types } from 'mongoose';
import { getObjectId } from '../../utils';
import { fakeObjectId } from '../common-test.utils';

describe('POST /comments', () => {
  let accessToken: string;
  let userId: string;
  let postId: Types.ObjectId;

  beforeAll(async () => {
    const user = await createAndLoginTestUser(validMockRegister);
    accessToken = user.accessToken;
    userId = user.userId.toString();
    postId = (await testCreatePost(validMockPost, accessToken)).body._id.toString();
  });

  beforeEach(async () => {
    await CommentModel.deleteMany({});
  });

  it('should create a comment for a given post ID', async () => {
    const commentData: CreateCommentObject = {
      content: 'Test Comment',
      postId,
    };

    const response = await testCreateComment(commentData, accessToken);

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.content).toBe(commentData.content);
    expect(response.body.postId).toBe(commentData.postId);
    expect(response.body.userId).toBe(userId);
  });

  it('should return an error if the postId is invalid', async () => {
    const commentData = {
      content: 'Test Comment',
      postId: getObjectId(fakeObjectId),
    };

    const response = await testCreateComment(commentData, accessToken);

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(response.body).toHaveProperty('error');
  });

  it('should return an error if the user is not authenticated', async () => {
    const commentData = {
      content: 'Test Comment',
      postId,
    };

    const response = await supertest(app).post('/comments').send(commentData);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should return 500 Internal Server Error on failure', async () => {
    jest.spyOn(UserModel, 'findById').mockRejectedValue(new Error('Internal Server Error'));

    const commentData = {
      content: 'Test Comment',
      postId,
    };

    const response = await testCreateComment(commentData, accessToken);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
