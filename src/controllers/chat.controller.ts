import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types, UpdateResult } from 'mongoose';

import { getUnreadChats, processChatsData, sortMessages } from '../utils/functions/chat.functions';
import {
  fetchUserChats,
  markMessagesAsReaded,
  getUnreadMsg,
  getChatById,
} from '../repository/chat.repository';
import { getChatMessagesSchema } from '../validations/chat.validation';
import { FormattedChat, FormattedMessage } from '../utils/interfaces/chat';
import { PopulatedChat } from '../utils/interfaces/populated';

// TODO: in every function - next errors instead of sending them to res

export const getUserChats = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  try {
    const chats: PopulatedChat[] = await fetchUserChats(new Types.ObjectId(userId));
    const processedChats: FormattedChat[] = processChatsData(chats, userId!);

    res.status(StatusCodes.OK).json(processedChats);
    return;
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    return;
  }
};

export const markMessagesAsRead = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const userId = req.user?.id;

  const { error } = getChatMessagesSchema.validate({ chatId });
  if (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.details[0].message });
    return;
  }

  try {
    const result: UpdateResult = await markMessagesAsReaded(
      new Types.ObjectId(chatId),
      new Types.ObjectId(userId),
    );
    res.status(StatusCodes.OK).json({ success: true, result });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    return;
  }
};

export const getUnreadMessages = async (req: Request, res: Response) => {
  const userId: string | undefined = req.user?.id;

  try {
    const chatsWithUnread: PopulatedChat[] = await getUnreadMsg(new Types.ObjectId(userId));
    const unreadMessages: FormattedChat[] = getUnreadChats(chatsWithUnread, userId!);

    res.status(StatusCodes.OK).json(unreadMessages);
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getChatMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const userId = req.user?.id;

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

    const sortedMessages: FormattedMessage[] = sortMessages(chat.messages, userId!);

    await markMessagesAsReaded(new Types.ObjectId(chatId), new Types.ObjectId(userId));

    res.status(StatusCodes.OK).json(sortedMessages);
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
