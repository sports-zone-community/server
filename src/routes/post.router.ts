import { Router } from 'express';
import { validationMiddleware } from '../middlewares';
import { createPost, getPostById, updatePost } from '../controllers/post.controller';
import { createPostSchema, postIdSchema, updatePostSchema } from '../validations/post.validation';

export const postRouter: Router = Router();

postRouter.get('/:postId', validationMiddleware({ paramsSchema: postIdSchema }), getPostById);
postRouter.post('/', validationMiddleware({ bodySchema: createPostSchema }), createPost);
postRouter.put(
  '/:postId',
  validationMiddleware({ bodySchema: updatePostSchema, paramsSchema: postIdSchema }),
  updatePost,
);
