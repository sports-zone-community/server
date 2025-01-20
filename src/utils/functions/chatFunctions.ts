import { PopulatedChat, PopulatedMessage, PopulatedUser } from '../interfaces/Populated';
import { Types } from 'mongoose';
import { PopulatedGroup } from '../interfaces/Populated';
import { Chat, Message } from '../interfaces/chat';
  
export const processChatsData = (chats: PopulatedChat[], userId: string): Chat[] => {
    return chats.map((chat: PopulatedChat) => {
      const lastMessage: PopulatedMessage = chat.messages[chat.messages.length - 1];
      const unreadCount: number = getUnreadCount(chat.messages, userId);
  
      return {
        chatId: chat._id as string,
        chatName: getChatName(chat, userId),
        lastMessage: formatLastMessage(lastMessage, userId),
        unreadCount
      };
    });
  };

  export const getUnreadChats = (chatsWithUnread: PopulatedChat[], userId: string): Chat[] => {
    return chatsWithUnread.map((chat: PopulatedChat) => {
      const unreadMsgs = chat.messages.filter(
        (msg: PopulatedMessage) => !msg.read.includes(new Types.ObjectId(userId)) && 
              msg.sender._id.toString() !== userId
      );

      return {
        chatId: chat._id as string,
        chatName: getChatName(chat, userId),
        isGroupChat: chat.isGroupChat,
        groupName: chat.isGroupChat ? (chat.groupId as PopulatedGroup)?.name : undefined,
        participants: chat.participants,
        unreadCount: unreadMsgs.length,
        lastMessage: formatLastMessage(unreadMsgs[unreadMsgs.length - 1], userId)
      };
    });
  };


  export const sortMessages = (messages: PopulatedMessage[], userId: string): Message[] => {
    return messages
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map((message: PopulatedMessage) => ({
        messageId: message._id.toString(),
        content: message.content,
        sender: {
          id: message.sender._id.toString(),
          name: (message.sender as unknown as PopulatedUser).fullName,
          username: (message.sender as unknown as PopulatedUser).username
        },
        timestamp: message.timestamp,
        formattedTime: new Date(message.timestamp).toLocaleString('he-IL', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        isRead: message.read.includes(new Types.ObjectId(userId)),
        read: message.read
      }));
  };
  
  export const formatChat = (chat: PopulatedChat, userId: Types.ObjectId, messages: Message[]): Chat => {
    return {
      chatId: chat._id as string,
      isGroupChat: chat.isGroupChat,
      chatName: chat.isGroupChat 
        ? (chat.groupId as unknown as PopulatedGroup)?.name 
        : (chat.participants.find((p: PopulatedUser) => p._id !== userId) as unknown as PopulatedUser)?.fullName,
      participants: chat.participants.map(p => ({
        _id: p._id,
        fullName: (p as unknown as PopulatedUser).fullName,
        username: (p as unknown as PopulatedUser).username
      })),
      messages: messages,
      lastMessage: messages[messages.length - 1],
      unreadCount: chat.messages.filter(m => !m.read.includes(new Types.ObjectId(userId))).length
    };
  }

export const getUnreadCount = (messages: PopulatedMessage[], userId: string): number => 
    messages.filter(
      msg => !msg.read.includes(new Types.ObjectId(userId)) && 
            msg.sender._id.toString() !== userId
    ).length;
  
const getChatName = (chat: PopulatedChat, userId: string): string | undefined => 
    chat.isGroupChat 
      ? (chat.groupId as PopulatedGroup)?.name 
      : (chat.participants.find((p: PopulatedUser) => p._id.toString() !== userId)?.fullName);

  
const formatLastMessage = (message: PopulatedMessage, userId: string): Message => {
    return {
      messageId: message._id.toString(),
      content: message.content,
      timestamp: message.timestamp,
      formattedTime: formatTimestamp(message.timestamp),
      isRead: message.read.includes(new Types.ObjectId(userId)),
      read: message.read,
      sender: {
        id: message.sender._id.toString(),
        name: (message.sender as unknown as PopulatedUser).fullName,
        username: (message.sender as unknown as PopulatedUser).username
      }
    };
  };
  
  
const formatTimestamp = (timestamp: Date): string => 
     new Date(timestamp).toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    });

  