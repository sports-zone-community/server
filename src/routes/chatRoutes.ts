import { Router } from 'express';
import { authMiddleware } from '../common/auth-middleware';
import {
  getUserChats,
  markMessagesAsRead,
  getUnreadMessages,
  getChatMessages
} from '../controllers/chat.controller';

const router: Router = Router();

router.get('/', authMiddleware, getUserChats);
router.put('/:chatId/read', authMiddleware, markMessagesAsRead);
router.get('/messages/unread', authMiddleware, getUnreadMessages);
router.get('/:chatId', authMiddleware, getChatMessages);

export default router; 
