import { createAndLoginTestUser } from '../../utils';
import supertest from 'supertest';
import { app } from '../../app';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

describe('USER ROUTES', () => {
  describe('GET /details', () => {
    it('should get the user details', async () => {
      const { accessToken, userId } = await createAndLoginTestUser();

      const response = await supertest(app)
        .get('/users/details')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ userId: userId.toString() });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('username');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('following');
      expect(response.body).toHaveProperty('provider');
      expect(response.body).toHaveProperty('picture');
    });

    it('should throw error for missing user id input', async () => {
      const { accessToken } = await createAndLoginTestUser();

      const response = await supertest(app)
        .get('/users/details')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should throw error for invalid user id input', async () => {
      const { accessToken } = await createAndLoginTestUser();
      const fakeUserId = 'fakeUserId';

      const response = await supertest(app)
        .get('/users/details')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ userId: fakeUserId });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should throw error for user not found', async () => {
      const { accessToken } = await createAndLoginTestUser();
      const fakeUserId = new mongoose.Types.ObjectId();

      const response = await supertest(app)
        .get('/users/details')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ userId: fakeUserId.toString() });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.error).toContain('User not found');
    });
  });

  describe('POST /toggle-follow', () => {
    it('should toggle follow to user', async () => {
      const { accessToken } = await createAndLoginTestUser();
      const { userId } = await createAndLoginTestUser('test1@example.com');

      const response = await supertest(app)
        .post('/users/toggle-follow/' + userId.toString())
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('username');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('following');
      expect(response.body).toHaveProperty('provider');
      expect(response.body).toHaveProperty('picture');
    });

    it('should throw error for can follow yourself ', async () => {
      const { accessToken, userId } = await createAndLoginTestUser();

      const response = await supertest(app)
        .post('/users/toggle-follow/' + userId.toString())
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.error).toContain('You cannot follow yourself');
    });

    it('should throw error for target user not found ', async () => {
      const { accessToken } = await createAndLoginTestUser();
      const fakeUserId = new mongoose.Types.ObjectId();

      const response = await supertest(app)
        .post('/users/toggle-follow/' + fakeUserId.toString())
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.error).toContain('User not found');
    });
  });
});
