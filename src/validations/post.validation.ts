import Joi from 'joi';
import { Post } from '../models';
import { mongoIdSchema } from './common.validation';

export type CreatePostObject = Omit<Post, 'userId' | 'likes'>;

export const createPostSchema: Joi.ObjectSchema<CreatePostObject> = Joi.object<CreatePostObject>({
  image: Joi.string().required(),
  content: Joi.string().min(3).max(255).required(),
  groupId: mongoIdSchema.optional(),
});

export type UpdatePostObject = Partial<Pick<Post, 'content' | 'image'>>;

export const updatePostSchema: Joi.ObjectSchema<UpdatePostObject> = Joi.object<UpdatePostObject>({
  image: Joi.string().optional(),
  content: Joi.string().min(3).max(255).optional(),
});

export interface PostIdParams {
  postId: string;
}

export const postIdSchema: Joi.ObjectSchema<PostIdParams> = Joi.object<PostIdParams>({
  postId: mongoIdSchema,
});

export interface PageQuery {
  page: number;
}

export const pageSchema: Joi.ObjectSchema<PageQuery> = Joi.object<PageQuery>({
  page: Joi.number().min(1).required(),
});
