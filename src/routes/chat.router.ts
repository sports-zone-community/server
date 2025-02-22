import { Router } from 'express';
import {
  getUserChats,
  markMessagesAsRead,
  getUnreadMessages,
  getChatMessages,
} from '../controllers/chat.controller';
import { validationMiddleware } from '../middlewares';
import { chatIdSchema } from '../validations';

export const chatRouter: Router = Router();

chatRouter.get('/', getUserChats);
chatRouter.put('/:chatId/read', validationMiddleware({ paramsSchema: chatIdSchema }), markMessagesAsRead);
chatRouter.get('/messages/unread', getUnreadMessages);
chatRouter.get('/:chatId', validationMiddleware({ paramsSchema: chatIdSchema }), getChatMessages);
