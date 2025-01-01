import supertest from 'supertest';
// import app from '../setup/jest.setup';
import { StatusCodes } from 'http-status-codes';
import { hash } from 'bcryptjs';
import { User } from '../../models/user.model';
import app from '../../app';

describe('AUTH ROUTES - POST /auth/register', () => {
  // afterEach(async () => {
  //   await User.deleteMany({});
  // });

  it('should register a new user', async () => {
    const mockUserRequest = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
      fullName: 'Test User',
    };

    const response = await supertest(app)
      .post('/auth/register')
      .send(mockUserRequest);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.message).toBe('User registered successfully');
    expect(response.body.newUser).toHaveProperty('email', 'test@example.com');
  });

  it('should return an error if a required field is missing', async () => {
    const mockUserRequest = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
    };

    const response = await supertest(app)
      .post('/auth/register')
      .send(mockUserRequest);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body.error).toBe('Please fill all fields');
  });

  it('should return an error if the user already exists', async () => {
    const mockUserRequest = {
      email: 'test@example.com',
      password: await hash('password123', 10),
      username: 'testuser',
      fullName: 'Test User',
    };
    await User.create(mockUserRequest);

    const response = await supertest(app)
      .post('/auth/register')
      .send(mockUserRequest);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body.error).toBe('User already exists');
  });
  it('should return 500 Internal Server Error on failure', async () => {
    const mockUserRequest = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
      fullName: 'Test User',
    };

    jest
      .spyOn(User.prototype, 'save')
      .mockRejectedValue(new Error('Internal Server Error'));

    const response = await supertest(app)
      .post('/auth/register')
      .send(mockUserRequest);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body.error).toBe('Internal Server Error');
  });
});
