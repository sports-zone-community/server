import { hash } from 'bcryptjs';
import { User } from '../../models/user.model';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import app from '../../app';

const createUser = async (
  email: string,
  password: string,
  username: string,
  fullName: string,
) => {
  const hashedPassword = await hash(password, 10);
  return User.create({
    email,
    password: hashedPassword,
    username,
    fullName,
  });
};

const testLogin = async (email: string, password: string) => {
  return supertest(app).post('/auth/login').send({ email, password });
};

describe('AUTH ROUTES - POST /auth/login', () => {
  it('should log in a user with valid credentials', async () => {
    await createUser(
      'test@example.com',
      'password123',
      'testuser',
      'Test User',
    );
    const response = await testLogin('test@example.com', 'password123');

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('should log in again to update refresh token', async () => {
    await createUser(
      'test@example.com',
      'password123',
      'testuser',
      'Test User',
    );
    await testLogin('test@example.com', 'password123');
    const response = await testLogin('test@example.com', 'password123');

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('should return an error for missing credentials', async () => {
    const response = await supertest(app).post('/auth/login').send({
      username: 'testuser',
      password: 'password123',
    });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body.error).toBe('Please fill all fields');
  });

  it('should return an error for user does not exists', async () => {
    const response = await supertest(app).post('/auth/login').send({
      email: 'notexists@gmail.com',
      password: 'password123',
    });

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.body.error).toBe('User does not exist');
  });

  it('should return an error for invalid credentials', async () => {
    const hashedPassword = await hash('password123', 10);

    await User.create({
      email: 'test@example.com',
      password: hashedPassword,
      username: 'testuser',
      fullName: 'Test User',
    });

    const response = await supertest(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'invalidpassword',
    });

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.body.error).toBe('Invalid credentials');
  });

  it('should return 500 Internal Server Error on failure', async () => {
    const mockUserRequest = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
      fullName: 'Test User',
    };

    jest
      .spyOn(User, 'findOne')
      .mockRejectedValue(new Error('Internal Server Error'));

    const response = await supertest(app)
      .post('/auth/login')
      .send(mockUserRequest);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body.error).toBe('Internal Server Error');
  });
});
