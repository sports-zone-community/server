import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import { createAndLoginTestUser } from '../../utils';
import path from 'path';

describe('Comment Controller - Delete Comment', () => {
  let accessToken: string;
  let userId: string;
  let postId: string;
  let commentId: string;

  beforeEach(async () => {
    const user = await createAndLoginTestUser();
    accessToken = user.accessToken;
    userId = user.userId;

    const postResponse = await supertest(app)
      .post('/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('content', 'This is a test post')
      .attach('image', path.resolve(__dirname, '../../../uploads/anonymous-user.jpg'));

    postId = postResponse.body.post._id;

    const commentResponse = await supertest(app)
      .post('/comments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ postId, content: 'This is a test comment' });

    commentId = commentResponse.body._id;
  });

  it('should delete a comment', async () => {
    const response = await supertest(app)
      .delete(`/comments/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toBe('Comment was deleted');
  });
});
