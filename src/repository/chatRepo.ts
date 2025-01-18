import { PopulatedUser, PopulatedGroup, PopulatedMessage } from '../utils/interfaces/Populated';
import { Chat } from '../models/chat.model';
import { Types } from 'mongoose';

export const fetchUserChats = async (userId: string) => {
    return Chat.find({ participants: userId })
      .populate<{ participants: PopulatedUser[] }>('participants', 'username fullName')
      .populate<{ groupId: PopulatedGroup }>('groupId', 'name')
      .populate<{ messages: PopulatedMessage[] }>({
        path: 'messages',
        populate: {
          path: 'sender',
          select: 'username fullName'
        }
      })
      .populate<{ lastMessage: PopulatedMessage }>({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username fullName'
        }
      });
  };

export const markMessagesAsReaded = async (chatId: string, userId: string) => {
    return Chat.updateMany(
      { _id: chatId },
      { $addToSet: { 'messages.$[elem].read': new Types.ObjectId(userId) } },
      { arrayFilters: [{ 'elem.sender': { $ne: userId }, 'elem.read': { $ne: new Types.ObjectId(userId) } }] }
    );
  };

export const getUnreadMsg = async (userId: string) => {
    return await Chat.find({
      participants: userId,
      messages: {
        $elemMatch: {
          read: { $ne: new Types.ObjectId(userId) },
          sender: { $ne: userId }
        }
      }
    })
    .populate<{ participants: PopulatedUser[] }>('participants', 'username fullName')
    .populate<{ groupId: PopulatedGroup }>('groupId', 'name');
  };

  export const getChatsById = async (chatId: string) => {
    return await Chat.findById(chatId)
    .populate('messages.sender', 'username fullName')
    .populate('groupId', 'name')
    .populate('participants', 'username fullName');
  };

  


  