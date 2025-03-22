import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import { createAndLoginTestUser } from '../../utils';
import path from 'path';

describe('Post Controller - Create Post', () => {
  let accessToken: string;

  beforeEach(async () => {
    const user = await createAndLoginTestUser();
    accessToken = user.accessToken;
  });

  it('should create a new post', async () => {
    const response = await supertest(app)
      .post('/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('content', 'This is a test post')
      .attach('image', path.resolve(__dirname, '../../../uploads/anonymous-user.jpg'));

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body.post).toHaveProperty('_id');
  });

  it('should return an error if content is missing', async () => {
    const response = await supertest(app)
      .post('/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('image', path.resolve(__dirname, '../../../uploads/anonymous-user.jpg'));

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).toHaveProperty('error');
  });

  it('should return an error if user is not a member of the group', async () => {
    const secondUser = await createAndLoginTestUser('newuser@gmail.com');
    const secondUserAccessToken = secondUser.accessToken;

    const groupResponse = await supertest(app)
      .post('/groups')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test Group', description: 'Test Description' });


    const groupId = groupResponse.body._id;

    const response = await supertest(app)
      .post('/posts')
      .set('Authorization', `Bearer ${secondUserAccessToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('content', 'This is a test post')
      .field('groupId', groupId)
      .attach('image', path.resolve(__dirname, '../../../uploads/anonymous-user.jpg'));


    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).toHaveProperty('error');
  });
});
