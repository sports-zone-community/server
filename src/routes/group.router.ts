import { Router } from 'express';
import { validationMiddleware } from '../middlewares';
import { createGroupSchema, groupIdSchema } from '../validations';
import { GroupController } from '../controllers';

export const groupRouter: Router = Router();

groupRouter.post(
  '/',
  validationMiddleware({ bodySchema: createGroupSchema }),
  GroupController.createGroup,
);

groupRouter.post(
  '/toggle-join/:groupId',
  validationMiddleware({ paramsSchema: groupIdSchema }),
  GroupController.toggleJoinGroup,
);
