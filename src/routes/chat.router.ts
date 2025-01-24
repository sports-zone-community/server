import { Router } from 'express';
import { authMiddleware } from '../common/auth-middleware';
import {
  getUserChats,
  markMessagesAsRead,
  getUnreadMessages,
  getChatMessages
} from '../controllers/chat.controller';

export const chatRouter: Router = Router();

chatRouter.get('/', authMiddleware, getUserChats);
chatRouter.put('/:chatId/read', authMiddleware, markMessagesAsRead);
chatRouter.get('/messages/unread', authMiddleware, getUnreadMessages);
chatRouter.get('/:chatId', authMiddleware, getChatMessages);
