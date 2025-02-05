import { CreateCommentObject } from '../../validations';
import supertest from 'supertest';
import { app } from '../../app';

export const testCreateComment = async (
  createComment: Partial<CreateCommentObject>,
  accessToken: string,
) =>
  await supertest(app)
    .post('/comments')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(createComment);

export const testGetCommentsByPostId = async (postId: string, accessToken: string) =>
  await supertest(app)
    .get('/comments')
    .query({ postId })
    .set('Authorization', `Bearer ${accessToken}`);
