import { Router } from 'express';
import { authMiddleware } from '../common/auth-middleware';
import { createGroup, joinGroup } from '../controllers/group.controller';

const router = Router();

router.post('/', authMiddleware, createGroup);
router.post('/:groupId/join', authMiddleware, joinGroup);

export default router; 