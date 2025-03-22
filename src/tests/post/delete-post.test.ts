import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import { createAndLoginTestUser } from '../../utils';
import path from 'path';

describe('Post Controller - Delete Post', () => {
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

  it('should delete a post by ID', async () => {
    const response = await supertest(app)
      .delete(`/posts/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(StatusCodes.NO_CONTENT);
  });

  it('should return an error if post ID does not exist', async () => {
    const response = await supertest(app)
      .delete('/posts/654654654654654654564564')
      .set('Authorization', `Bearer ${accessToken}`);

    console.log({ response });

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(response.body).toHaveProperty('error');
  });
});
