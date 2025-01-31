import { Router } from 'express';
import { validationMiddleware } from '../middlewares';
import { commentIdSchema, createCommentSchema, postIdSchema } from '../validations';
import { CommentController } from '../controllers';

export const commentRouter: Router = Router();

commentRouter.get(
  '/',
  validationMiddleware({ querySchema: postIdSchema }),
  CommentController.getCommentByPostId,
);

commentRouter.post(
  '/',
  validationMiddleware({ bodySchema: createCommentSchema }),
  CommentController.addComment,
);

commentRouter.delete(
  '/:commentId',
  validationMiddleware({ paramsSchema: commentIdSchema }),
  CommentController.deleteComment,
);
