import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import { createAndLoginTestUser } from '../../utils';

describe('Search Controller', () => {
  let accessToken: string;

  beforeEach(async () => {
    const user = await createAndLoginTestUser();
    accessToken = user.accessToken;
  });

  describe('GET /search', () => {
    it('should return search results for a valid query', async () => {
      const response = await supertest(app)
        .get(`/search/test`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Array);
    });

    it('should return an error if the user is not authenticated', async () => {
      const response = await supertest(app)
        .get(`/search/test`)
        .set('Authorization', `Bearer invalid-token`);

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });
});