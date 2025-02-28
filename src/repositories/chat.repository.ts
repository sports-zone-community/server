import {
  PopulatedChat,
  PopulatedGroup,
  PopulatedMessage,
  PopulatedUser,
} from '../utils/interfaces/populated';
import { ChatModel, Chat, IMessage } from '../models';
import { Types, UpdateResult } from 'mongoose';

export const fetchUserChats = async (userId: Types.ObjectId, isGroupChat: boolean): Promise<PopulatedChat[]> =>
  ChatModel.find({ participants: userId, isGroupChat: isGroupChat })
    .populate<{ participants: PopulatedUser[] }>('participants', 'username name picture')
    .populate<{ groupId: PopulatedGroup }>('groupId', 'name image')
    .populate<{ messages: PopulatedMessage[] }>({
      path: 'messages',
      populate: {
        path: 'sender',
        select: 'username name',
      },
    })
    .populate<{ lastMessage: PopulatedMessage }>({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'username name',
      },
    });

export const markMessagesAsReaded = async (
  chatId: Types.ObjectId,
  userId: Types.ObjectId,
): Promise<UpdateResult> =>
  ChatModel.updateMany(
    { _id: chatId },
    { $addToSet: { 'messages.$[elem].read': userId } },
    { arrayFilters: [{ 'elem.sender': { $ne: userId }, 'elem.read': { $ne: userId } }] },
  );

export const getUnreadMsg = async (userId: Types.ObjectId): Promise<PopulatedChat[]> =>
  await ChatModel.find({
    participants: userId,
    messages: {
      $elemMatch: {
        read: { $ne: userId },
        sender: { $ne: userId },
      },
    },
  })
    .populate<{ participants: PopulatedUser[] }>('participants', 'username name')
    .populate<{ groupId: PopulatedGroup }>('groupId', 'name')
    .populate<{ messages: PopulatedMessage[] }>('messages.sender', 'username name')
    .populate<{ lastMessage: PopulatedMessage }>('lastMessage.sender', 'username name');

export const getChatById = async (chatId: Types.ObjectId): Promise<PopulatedChat | null> =>
  await ChatModel.findById(chatId)
    .populate<{ messages: PopulatedMessage[] }>('messages.sender', 'username name')
    .populate<{ groupId: PopulatedGroup }>('groupId', 'name')
    .populate<{ participants: PopulatedUser[] }>('participants', 'username name')
    .populate<{ lastMessage: PopulatedMessage }>('lastMessage.sender', 'username name');

export const findPrivateChat = async (from: string, to: string): Promise<Chat | null> =>
  await ChatModel.findOne({
    participants: { $all: [from, to] },
    isGroupChat: false,
  }) as Chat;

export const createPrivateChat = async (from: string, to: string): Promise<Chat> =>
  await ChatModel.create({
    participants: [from, to],
    isGroupChat: false,
    messages: [],
  });

export const findGroupChat = async (chatId: Types.ObjectId, userId: Types.ObjectId): Promise<Chat | null> =>
  await ChatModel.findOne({
    _id: chatId,
    isGroupChat: true,
    participants: userId,
  }) as Chat;

export const updateMessagesReadStatus = async (
  chatId: Types.ObjectId,
  userId: Types.ObjectId,
): Promise<void> => {
  await ChatModel.updateMany(
    { _id: chatId },
    {
      $addToSet: {
        'messages.$[elem].read': userId,
      },
    },
    {
      arrayFilters: [
        {
          'elem.sender': { $ne: userId },
          'elem.read': { $ne: userId },
        },
      ],
    },
  );
};

export const getChatByIdAndUserId = async (chatId: Types.ObjectId, userId: Types.ObjectId): Promise<PopulatedChat | null> =>
  await ChatModel.findOne({
    _id: chatId,
    participants: userId,
  }) as PopulatedChat;

export const saveMessage = async (
  chat: Chat,
  message: IMessage
): Promise<Chat> => {
  chat.messages.push(message);
  chat.lastMessage = message;
  return await chat.save();
};
