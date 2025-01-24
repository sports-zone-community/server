import { Router } from 'express';
import {
  getUserChats,
  markMessagesAsRead,
  getUnreadMessages,
  getChatMessages,
} from '../controllers/chat.controller';
import { authMiddleware } from '../middlewares';

export const chatRouter: Router = Router();

chatRouter.get('/', authMiddleware, getUserChats);
chatRouter.put('/:chatId/read', authMiddleware, markMessagesAsRead);
chatRouter.get('/messages/unread', authMiddleware, getUnreadMessages);
chatRouter.get('/:chatId', authMiddleware, getChatMessages);
