import { Router } from 'express';
import { createGroup, joinGroup } from '../controllers/group.controller';
import { authMiddleware } from '../middlewares';

export const groupRouter: Router = Router();

groupRouter.post('/', authMiddleware, createGroup);
groupRouter.post('/:groupId/join', authMiddleware, joinGroup);

