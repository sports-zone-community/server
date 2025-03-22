import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import { createAndLoginTestUser } from '../../utils';
import path from 'path';

describe('Post Controller - Update Post', () => {
  let accessToken: string;
  let postId: string;

  beforeEach(async () => {
    const user = await createAndLoginTestUser();
    accessToken = user.accessToken;

    const postResponse = await supertest(app)
      .post('/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('content', 'This is a test post')
      .attach('image', path.resolve(__dirname, '../../../uploads/anonymous-user.jpg'));

    postId = postResponse.body.post._id;
  });

  it('should update a post by ID', async () => {
    const response = await supertest(app)
      .put(`/posts/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .field('content', 'Updated content')
      .attach('image', path.resolve(__dirname, '../../../uploads/anonymous-user.jpg'));

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('content', 'Updated content');
  });
});
