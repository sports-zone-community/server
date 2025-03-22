import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import { createAndLoginTestUser } from '../../utils';
import path from 'path';

describe('Comment Controller - Get Comments By Post Id', () => {
  let accessToken: string;
  let userId: string;
  let postId: string;

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
  });

  it('should get comments for a post', async () => {
    const response = await supertest(app)
      .get(`/comments?postId=${postId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toBeInstanceOf(Array);
  });
});
