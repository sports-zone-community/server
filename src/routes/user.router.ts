import { Router } from 'express';
import { validationMiddleware } from '../middlewares';
import { updateUserSchema, userIdSchema } from '../validations';
import { UserController } from '../controllers';
import { upload } from '../middlewares/upload.middleware';

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

userRouter.put(
  '/update',
  upload.single('image'),
  validationMiddleware({ bodySchema: updateUserSchema }),
  UserController.updateUser,
);
