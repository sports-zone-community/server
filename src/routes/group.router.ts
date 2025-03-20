import { Router } from 'express';
import { validationMiddleware } from '../middlewares';
import { createGroupSchema, groupIdSchema } from '../validations';
import { GroupController } from '../controllers';
import { upload } from '../middlewares/upload.middleware';

export const groupRouter: Router = Router();

groupRouter.get('/', GroupController.getGroups);

groupRouter.get(
  '/:groupId',
  validationMiddleware({ paramsSchema: groupIdSchema }),
  GroupController.getGroupDetailsById,
);

groupRouter.post(
  '/',
  upload.single('image'),
  validationMiddleware({ bodySchema: createGroupSchema }),
  GroupController.createGroup,
);

groupRouter.post(
  '/toggle-join/:groupId',
  validationMiddleware({ paramsSchema: groupIdSchema }),
  GroupController.toggleJoinGroup,
);
