import Joi from 'joi';
import { Post } from '../models';
import { mongoIdSchema } from './common.validation';

export type CreatePostObject = Omit<Post, 'userId' | 'likes'>;

export const createPostSchema: Joi.ObjectSchema<CreatePostObject> = Joi.object({
  image: Joi.string().required(),
  content: Joi.string().min(3).max(255).required(),
  groupId: mongoIdSchema,
});

export type UpdatePostObject = Partial<Pick<Post, 'content' | 'image'>>;

export const updatePostSchema: Joi.ObjectSchema<UpdatePostObject> = Joi.object({
  image: Joi.string().optional(),
  content: Joi.string().min(3).max(255).optional(),
});

export interface PostIdParams {
  postId: string;
}

export const postIdSchema: Joi.ObjectSchema<PostIdParams> = Joi.object({
  postId: mongoIdSchema,
});
