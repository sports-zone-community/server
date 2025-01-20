import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types, UpdateResult } from 'mongoose';

import { PopulatedChat } from '../utils/interfaces/Populated';
import { logStartFunction, logEndFunction, logError } from '../utils/utils';
import { formatChat, getUnreadChats, processChatsData, sortMessages } from '../utils/functions/chatFunctions';
import { fetchUserChats, markMessagesAsReaded, getUnreadMsg, getChatById } from '../repository/chat.repository';
import { getChatMessagesSchema } from '../validations/chat.validation';
import { Chat, Message } from '../utils/interfaces/chat';

export const getUserChats = async (req: Request, res: Response) => {
  logStartFunction('getUserChats');
  const userId = req.user?.id;

  try {
    const chats: PopulatedChat[] = await fetchUserChats(new Types.ObjectId(userId));
    const processedChats: Chat[] = processChatsData(chats, userId!);

    logEndFunction('getUserChats');
    res.status(StatusCodes.OK).json(processedChats);
    return;
  } catch (error: any) {
    logError(error.message, 'getUserChats');
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    return;
  }
};

export const markMessagesAsRead = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const userId = req.user?.id;
  logStartFunction('markMessagesAsRead');

  const { error } = getChatMessagesSchema.validate({ chatId });
  if (error) {
     res.status(StatusCodes.BAD_REQUEST).json({ error: error.details[0].message });
     return;
  }

  try {
    const result: UpdateResult = await markMessagesAsReaded(new Types.ObjectId(chatId), new Types.ObjectId(userId));
    logEndFunction('markMessagesAsRead');
    res.status(StatusCodes.OK).json({ success: true, result });
  } catch (error: any) {
    logError(error.message, 'markMessagesAsRead');
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    return;
  }
};

export const getUnreadMessages = async (req: Request, res: Response) => {
  logStartFunction('getUnreadMessages');
  const userId: string | undefined = req.user?.id;

  try {
    const chatsWithUnread: PopulatedChat[] = await getUnreadMsg(new Types.ObjectId(userId));
    const unreadMessages: Chat[] = getUnreadChats(chatsWithUnread, userId!);

    logEndFunction('getUnreadMessages');
    res.status(StatusCodes.OK).json(unreadMessages);
  } catch (error: any) {
    logError(error.message, 'getUnreadMessages');
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getChatMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const userId = req.user?.id;
  logStartFunction('getChatMessages');

  const { error } = getChatMessagesSchema.validate({ chatId });
  if (error) {
     res.status(StatusCodes.BAD_REQUEST).json({ error: error.details[0].message });
     return;
  }

  try {
    const chat: PopulatedChat | null = await getChatById(new Types.ObjectId(chatId));
    if (!chat) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Chat not found' });
      return;
    }

    const sortedMessages: Message[] = sortMessages(chat.messages, userId!);

    const chatData: Chat = formatChat(chat, new Types.ObjectId(userId), sortedMessages)

    await markMessagesAsReaded(new Types.ObjectId(chatId), new Types.ObjectId(userId));

    logEndFunction('getChatMessages');
    res.status(StatusCodes.OK).json(chatData);
  } catch (error: any) {
    logError(error.message, 'getChatMessages');
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
