import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import {
  createAndLoginTestUser,
  otherValidMockRegister,
  validMockRegister,
} from '../auth/auth-test.utils';
import { CommentModel } from '../../models';
import { testCreatePost, validMockPost } from '../post/post-test.utils';
import { testCreateComment } from './comment-test.utils';
import { getObjectId } from '../../utils';

describe('DELETE /comments/:id', () => {
  let accessToken: string;
  let postId: string;
  let commentId: string;

  beforeEach(async () => {
    await CommentModel.deleteMany({});

    accessToken = (await createAndLoginTestUser(validMockRegister)).accessToken;

    const postResponse = await testCreatePost(validMockPost, accessToken);
    postId = postResponse.body._id.toString();

    const commentResponse = await testCreateComment(
      { content: 'Test Comment', postId: getObjectId(postId) },
      accessToken,
    );
    commentId = commentResponse.body._id.toString();
  });

  it('should delete a comment by ID', async () => {
    const response = await supertest(app)
      .delete(`/comments/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(StatusCodes.OK);

    const comment = await CommentModel.findById(commentId);
    expect(comment).toBeNull();
  });

  it('should return an error if the comment ID is invalid', async () => {
    const response = await supertest(app)
      .delete('/comments/invalid-id')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).toHaveProperty('error');
  });

  it('should return an error if the user is not authenticated', async () => {
    const response = await supertest(app).delete(`/comments/${commentId}`);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should return 500 Internal Server Error on failure', async () => {
    jest
      .spyOn(CommentModel, 'findByIdAndDelete')
      .mockRejectedValue(new Error('Internal Server Error'));

    const response = await supertest(app)
      .delete(`/comments/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it('should return a forbidden error if the user is not the owner', async () => {
    const otherAccessToken: string = (await createAndLoginTestUser(otherValidMockRegister))
      .accessToken;

    const response = await supertest(app)
      .delete(`/comments/${commentId}`)
      .set('Authorization', `Bearer ${otherAccessToken}`);

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
  });
});
