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
