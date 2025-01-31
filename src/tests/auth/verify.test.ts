import { StatusCodes } from 'http-status-codes';
import { createAndLoginTestUser } from '../../utils';
import supertest from 'supertest';
import { app } from '../../app';
import { UserModel } from '../../models';

describe('AUTH ROUTES - POST /auth/verify', () => {
  it('should verify user', async () => {
    const { accessToken } = await createAndLoginTestUser();

    const response = await supertest(app)
      .get('/auth/verify')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(StatusCodes.OK);
  });

  it('should return user not found', async () => {
    const { accessToken } = await createAndLoginTestUser();
    jest.spyOn(UserModel, 'findById').mockResolvedValue(undefined);

    const response = await supertest(app)
      .get('/auth/verify')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(response.body.error).toContain('User not found');
  });
});
