import Joi from 'joi';
import { mongoIdSchema } from './common.validation';
import { Comment } from '../models';

export type CreateCommentObject = Omit<Comment, 'userId'>;

export const createCommentSchema: Joi.ObjectSchema<CreateCommentObject> =
  Joi.object<CreateCommentObject>({
    content: Joi.string().min(3).max(255).required(),
    postId: mongoIdSchema,
  });

export interface CommentIdParams {
  commentId: string;
}

export const commentIdSchema: Joi.ObjectSchema<CommentIdParams> = Joi.object<CommentIdParams>({
  commentId: mongoIdSchema,
});
