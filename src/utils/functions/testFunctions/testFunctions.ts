import supertest from 'supertest';
import app from '../../../app';
import { User } from '../../../models/user.model';

export const mockPopulateMock = () => {
    return { populate: mockPopulateMock };
  }

export const createUser = async (email = 'test@example.com') => {
    const mockUserRequest = {
      email,
      password: 'password123',
      username: email.split('@')[0],
      fullName: 'Test User',
    };
    await supertest(app).post('/auth/register').send(mockUserRequest);
    const loginResponse = await supertest(app).post('/auth/login').send({
      email,
      password: 'password123',
    });
    const user = await User.findOne({ email });
    return {
      token: loginResponse.body.accessToken,
      userId: user?._id as string
    };
  };