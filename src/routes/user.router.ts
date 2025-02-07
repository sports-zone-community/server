import { Router } from 'express';
import { validationMiddleware } from '../middlewares';
import { userIdSchema } from '../validations';
import { UserController } from '../controllers';

export const userRouter: Router = Router();

userRouter.post(
  '/toggle-follow/:userId',
  validationMiddleware({ paramsSchema: userIdSchema }),
  UserController.toggleFollow,
);

userRouter.get(
  '/details',
  validationMiddleware({ querySchema: userIdSchema }),
  UserController.getUserDetailsById,
);
