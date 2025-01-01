import { User } from '../../models/user.model';
import { sign } from 'jsonwebtoken';
import supertest from 'supertest';
// import app from '../setup/jest.setup';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import app from '../../app';

describe('AUTH ROUTES - POST /auth/refreshToken', () => {
  it('should refresh tokens for a valid refresh token', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'hashedpassword',
      username: 'testuser',
      fullName: 'Test User',
      tokens: [],
    });

    const refreshToken = sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET!,
    );
    user.tokens.push(refreshToken);
    await user.save();

    const response = await supertest(app)
      .post('/auth/refreshToken')
      .set('Authorization', `Bearer ${refreshToken}`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('should return an error for an invalid request', async () => {
    const response = await supertest(app).post('/auth/refreshToken');

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body.error).toBe('Invalid request');
  });

  it('should return an error for an invalid token', async () => {
    const response = await supertest(app)
      .post('/auth/refreshToken')
      .set('Authorization', 'Bearer invalidtoken');

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body.error).toBe('Invalid token');
  });

  it('should return an error for user not found', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();

    const refreshToken = sign(
      { id: fakeUserId },
      process.env.REFRESH_TOKEN_SECRET!,
    );

    const response = await supertest(app)
      .post('/auth/refreshToken')
      .set('Authorization', `Bearer ${refreshToken}`);

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.body.error).toBe('user not found');
  });

  it('should return an error for token not found', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();
    const user = new User({
      _id: fakeUserId,
      email: 'test@example.com',
      password: 'hashedpassword',
      username: 'testuser',
      fullName: 'Test User',
      tokens: ['differentToken'],
    });

    await user.save();

    const refreshToken = sign(
      { id: fakeUserId.toString() },
      process.env.REFRESH_TOKEN_SECRET!,
    );

    const response = await supertest(app)
      .post('/auth/refreshToken')
      .set('Authorization', `Bearer ${refreshToken}`);

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.body.error).toBe('token not found');
  });

  it('should return 500 Internal Server Error on failure', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'hashedpassword',
      username: 'testuser',
      fullName: 'Test User',
      tokens: [],
    });

    const refreshToken = sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET!,
    );
    user.tokens.push(refreshToken);
    await user.save();

    jest
      .spyOn(User, 'findById')
      .mockRejectedValue(new Error('Internal Server Error'));

    const response = await supertest(app)
      .post('/auth/refreshToken')
      .set('Authorization', `Bearer ${refreshToken}`);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body.error).toBe('Internal Server Error');
  });
});
