import { Router } from 'express';
import {
  getChatMessages,
  getSuggestion,
  getUnreadMessages,
  getUserChats,
  markMessagesAsRead,
} from '../controllers/chat.controller';
import { authMiddleware, validationMiddleware } from '../middlewares';
import { getSuggestionSchema } from '../validations';

export const chatRouter: Router = Router();

chatRouter.get('/', authMiddleware, getUserChats);
chatRouter.put('/:chatId/read', authMiddleware, markMessagesAsRead);
chatRouter.get('/messages/unread', authMiddleware, getUnreadMessages);
chatRouter.get('/:chatId', authMiddleware, getChatMessages);
chatRouter.post(
  '/ai/suggestion',
  validationMiddleware({ bodySchema: getSuggestionSchema }),
  getSuggestion,
);
