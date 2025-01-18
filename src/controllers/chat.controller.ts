import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PopulatedGroup, PopulatedUser } from '../utils/interfaces/Populated';
import { logStartFunction, logEndFunction, logError } from '../utils/utils';
import { chatValidators } from '../validator/chat.validator';
import { getUnreadChats, processChatsData, sortMessages } from '../utils/functions/chatFunctions';
import { fetchUserChats, markMessagesAsReaded, getUnreadMsg, getChatsById } from '../repository/chatRepo';


export const getUserChats = async (req: Request, res: Response) => {
  logStartFunction('getUserChats');
  const userId = req.user?.id;

  try {
    const chats = await fetchUserChats(userId!);
    const processedChats = processChatsData(chats, userId!);

    if (processedChats.length === 0) {
       res.status(StatusCodes.NOT_FOUND).json({ error: 'No chats found for the user' });
       return;
    }

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
  logStartFunction('markMessagesAsRead');
  const { chatId } = req.params;
  const userId = req.user?.id;

  const { error } = chatValidators.markMessagesAsReadSchema.validate({ chatId, userId });
  if (error) {
     res.status(StatusCodes.BAD_REQUEST).json({ error: error.details[0].message });
     return;
  }

  try {
    await markMessagesAsReaded(chatId, userId!);

    logEndFunction('markMessagesAsRead');
    res.status(StatusCodes.OK).json({ success: true });
  } catch (error: any) {
    logError(error.message, 'markMessagesAsRead');
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    return;
  }
};

export const getUnreadMessages = async (req: Request, res: Response) => {
  logStartFunction('getUnreadMessages');
  const userId = req.user?.id;

  try {
    const chatsWithUnread = await getUnreadMsg(userId!);
    const unreadMessages = getUnreadChats(chatsWithUnread, userId!);

    logEndFunction('getUnreadMessages');
    res.status(StatusCodes.OK).json(unreadMessages);
  } catch (error: any) {
    logError(error.message, 'getUnreadMessages');
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getChatMessages = async (req: Request, res: Response) => {
  logStartFunction('getChatMessages');
  const { chatId } = req.params;
  const userId = req.user?.id;

  const { error } = chatValidators.getChatMessagesSchema.validate({ chatId });
  if (error) {
     res.status(StatusCodes.BAD_REQUEST).json({ error: error.details[0].message });
     return;
  }

  try {
    const chat = await getChatsById(chatId);
    if (!chat) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Chat not found' });
      return;
    }

    const sortedMessages = sortMessages(chat.messages, userId!);

    const chatData = {
      chatId: chat._id,
      isGroupChat: chat.isGroupChat,
      chatName: chat.isGroupChat 
        ? (chat.groupId as unknown as PopulatedGroup)?.name 
        : (chat.participants.find(p => p._id.toString() !== userId) as unknown as PopulatedUser)?.fullName,
      participants: chat.participants.map(p => ({
        id: p._id,
        name: (p as unknown as PopulatedUser).fullName,
        username: (p as unknown as PopulatedUser).username
      })),
      messages: sortedMessages
    };

    await markMessagesAsReaded(chatId, userId!);

    logEndFunction('getChatMessages');
    res.status(StatusCodes.OK).json(chatData);
  } catch (error: any) {
    logError(error.message, 'getChatMessages');
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
