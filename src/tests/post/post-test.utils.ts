import { CreatePostObject } from '../../validations';
import supertest from 'supertest';
import { app } from '../../app';

export const validMockPost: CreatePostObject = {
  image: 'test-image-url',
  content: 'This is a test post',
};

export const invalidMockPost: Partial<CreatePostObject> = { image: validMockPost.image };

export const testCreatePost = async (createPost: Partial<CreatePostObject>, accessToken: string) =>
  await supertest(app)
    .post('/posts')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(createPost);

export const testGetPostById = async (postId: string, accessToken: string) =>
  await supertest(app).get(`/posts/${postId}`).set('Authorization', `Bearer ${accessToken}`);

export const testDeletePost = async (postId: string, accessToken: string) =>
  await supertest(app).delete(`/posts/${postId}`).set('Authorization', `Bearer ${accessToken}`);
