import { Router } from 'express';
import { authMiddleware } from '../common/auth-middleware';
import { createGroup, joinGroup } from '../controllers/group.controller';

export const groupRouter: Router = Router();

groupRouter.post('/', authMiddleware, createGroup);
groupRouter.post('/:groupId/join', authMiddleware, joinGroup);

