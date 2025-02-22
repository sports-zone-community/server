import {
  PopulatedChat,
  PopulatedGroup,
  PopulatedMessage,
  PopulatedUser,
} from '../utils/interfaces/populated';
import { ChatModel, Chat } from '../models';
import { Types, UpdateResult } from 'mongoose';

export const fetchUserChats = async (userId: Types.ObjectId): Promise<PopulatedChat[]> =>
  ChatModel.find({ participants: userId })
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
