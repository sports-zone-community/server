import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import { createAndLoginTestUser } from '../../utils';
import path from 'path';

describe('Post Controller - Get Posts By User ID', () => {
  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    const user = await createAndLoginTestUser();
    accessToken = user.accessToken;
    userId = user.userId;

    await supertest(app)
      .post('/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('content', 'This is a test post')
      .attach('image', path.resolve(__dirname, '../../../uploads/anonymous-user.jpg'));
  });

  it('should get posts by user ID', async () => {
    const response = await supertest(app)
      .get(`/posts/user/${userId}?page=1`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should return an error if the user is not authenticated', async () => {
    const response = await supertest(app)
      .get(`/posts/user/${userId}?page=1`)
      .set('Authorization', `Bearer invalid-token`);

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should return an error if the page number is invalid', async () => {
    const response = await supertest(app)
      .get(`/posts/user/${userId}?page=-1`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });
});
