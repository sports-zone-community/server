import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types, UpdateResult } from 'mongoose';

import { getUnreadChats, processChatsData, sortMessages } from '../utils';
import { GetSuggestionObject } from '../validations';
import { FormattedChat, FormattedMessage } from '../utils/interfaces/chat';
import { PopulatedChat } from '../utils/interfaces/populated';
import { ChatRepository } from '../repositories';
import { GenerateContentResult, GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/config';

export const getUserChats = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const isGroupChat: boolean = req.query.isGroupChat === 'true';
  const chats: PopulatedChat[] = await ChatRepository.fetchUserChats(new Types.ObjectId(userId), isGroupChat);
  const processedChats: FormattedChat[] = processChatsData(chats, userId!);
  res.status(StatusCodes.OK).json(processedChats);
};

export const markMessagesAsRead = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const userId = req.user?.id;

    const result: UpdateResult = await ChatRepository.markMessagesAsReaded(
      new Types.ObjectId(chatId),
      new Types.ObjectId(userId),
    );
  res.status(StatusCodes.OK).json({ success: true, result });
};

export const getUnreadMessages = async (req: Request, res: Response) => {
  const userId: string | undefined = req.user?.id;

  const chatsWithUnread: PopulatedChat[] = await ChatRepository.getUnreadMsg(
    new Types.ObjectId(userId),
    );
    const unreadMessages: FormattedChat[] = getUnreadChats(chatsWithUnread, userId!);

  res.status(StatusCodes.OK).json(unreadMessages);
};

export const getChatMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const userId = req.user?.id;

  const chat: PopulatedChat | null = await ChatRepository.getChatById(new Types.ObjectId(chatId));

  if (!chat) {
    res.status(StatusCodes.NOT_FOUND).json({ error: 'Chat not found' });
      return;
    }

  const sortedMessages: FormattedMessage[] = sortMessages(chat.messages, userId!);

  await ChatRepository.markMessagesAsReaded(
    new Types.ObjectId(chatId),
     new Types.ObjectId(userId),
  );

  res.status(StatusCodes.OK).json(sortedMessages);
};

const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(config.ai.token);
const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const getSuggestion = async (req: Request, res: Response) => {
  const { prompt }: GetSuggestionObject = req.body;

  const suggestion: GenerateContentResult = await model.generateContent(
    `${prompt},  Keep it concise and under 50 words`,
  );
  res.status(StatusCodes.OK).json({ suggestion: suggestion.response.text() });
};
