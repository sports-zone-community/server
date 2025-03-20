import { Router } from 'express';
import { validationMiddleware } from '../middlewares';
import {
  createPostSchema, groupIdSchema,
  pageSchema,
  postIdSchema,
  updatePostSchema,
  userIdSchema,
} from '../validations';
import { PostController } from '../controllers';
import { upload } from '../middlewares/upload.middleware';

export const postRouter: Router = Router();

postRouter.get(
  '/explore',
  validationMiddleware({ querySchema: pageSchema }),
  PostController.getExplorePosts,
);

postRouter.get(
  '/user/:userId',
  validationMiddleware({ paramsSchema: userIdSchema, querySchema: pageSchema }),
  PostController.getPostsByUserId,
);

postRouter.get(
  '/group/:groupId',
  validationMiddleware({ paramsSchema: groupIdSchema, querySchema: pageSchema }),
  PostController.getPostsByGroupId,
);

postRouter.get(
  '/:postId',
  validationMiddleware({ paramsSchema: postIdSchema }),
  PostController.getPostById,
);

postRouter.post(
  '/',
  upload.single('image'),
  validationMiddleware({ bodySchema: createPostSchema }),
  PostController.createPost,
);

postRouter.put(
  '/:postId',
  upload.single('image'),
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
