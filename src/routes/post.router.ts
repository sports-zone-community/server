import { Router } from 'express';
import { validationMiddleware } from '../middlewares';
import { createPostSchema, postIdSchema, updatePostSchema } from '../validations';
import { PostController } from '../controllers';

export const postRouter: Router = Router();

postRouter.get('/own', PostController.getPostsByUserId);

postRouter.get(
  '/:postId',
  validationMiddleware({ paramsSchema: postIdSchema }),
  PostController.getPostById,
);

postRouter.post(
  '/',
  validationMiddleware({ bodySchema: createPostSchema }),
  PostController.createPost,
);

postRouter.put(
  '/:postId',
  validationMiddleware({ bodySchema: updatePostSchema, paramsSchema: postIdSchema }),
  PostController.updatePost,
);

postRouter.delete(
  '/:postId',
  validationMiddleware({ paramsSchema: postIdSchema }),
  PostController.deletePost,
);

postRouter.post(
  '/toggle-like/:postId',
  validationMiddleware({ paramsSchema: postIdSchema }),
  PostController.toggleLike,
);
