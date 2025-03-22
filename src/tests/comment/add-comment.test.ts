import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import { createAndLoginTestUser } from '../../utils';
import path from 'path';

describe('Comment Controller - Add Comment', () => {
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

  describe('POST /comments', () => {
    it('should create a comment', async () => {
      const response = await supertest(app)
        .post('/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ postId, content: 'This is a test comment' });

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toHaveProperty('_id');
    });

    it('should return an error if content is missing', async () => {
      const response = await supertest(app)
        .post('/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ postId });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('error');
    });
  });
});