import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import { createAndLoginTestUser } from '../../utils';

describe('Post Controller - Get Explore Posts', () => {
  let accessToken: string;

  beforeEach(async () => {
    const user = await createAndLoginTestUser();
    accessToken = user.accessToken;
  });

  it('should get explore posts', async () => {
    const response = await supertest(app)
      .get('/posts/explore?page=1')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should return an error if the user is not authenticated', async () => {
    const response = await supertest(app)
      .get('/posts/explore?page=1')
      .set('Authorization', `Bearer invalid-token`);

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should return an error if the page number is invalid', async () => {
    const response = await supertest(app)
      .get('/posts/explore?page=-1')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });
});
