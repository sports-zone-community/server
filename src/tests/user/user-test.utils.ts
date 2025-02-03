import supertest from 'supertest';
import { app } from '../../app';

export const testToggleFollow = async (userIdToFollow: string, accessToken: string) =>
  await supertest(app)
    .post(`/users/toggle-follow/${userIdToFollow}`)
    .set('Authorization', `Bearer ${accessToken}`);
