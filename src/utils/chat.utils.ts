import { PopulatedChat, PopulatedMessage, PopulatedUser } from './interfaces/populated';
import { Types } from 'mongoose';
import { PopulatedGroup } from './interfaces/populated';
import { FormattedChat, FormattedMessage } from './interfaces/chat';
  
export const processChatsData = (chats: PopulatedChat[], userId: string): FormattedChat[] => {
    const processedChats = chats.map((chat: PopulatedChat) => {
      const lastMessage: PopulatedMessage = chat.messages[chat.messages.length - 1];
      const unreadCount: number = getUnreadCount(chat.messages, userId);
      const chatName: string | undefined = getChatName(chat, userId);
      const image: string | undefined = getChatImage(chat, userId);

      return {
        chatId: chat._id as string,
        chatName: chatName,
        lastMessage: formatLastMessage(lastMessage, userId),
        unreadCount,
        isGroupChat: chat.isGroupChat,
        groupName: chat.isGroupChat ? (chat.groupId as PopulatedGroup)?.name : undefined,
        image: image,
        groupId: chat.isGroupChat ? (chat.groupId as PopulatedGroup)?._id.toString() : undefined,
        participants: chat.participants
      };
    });

    return processedChats.sort((a, b) => {
      const timeA = a.lastMessage?.timestamp?.getTime() || 0;
      const timeB = b.lastMessage?.timestamp?.getTime() || 0;
      return timeB - timeA;
    });
};

  export const getUnreadChats = (chatsWithUnread: PopulatedChat[], userId: string): FormattedChat[] => {
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


  export const sortMessages = (messages: PopulatedMessage[], userId: string): FormattedMessage[] => {
    if (!messages || messages.length === 0) return [];
    
    return messages
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((message: PopulatedMessage) => ({
        messageId: message._id.toString(),
        content: message.content,
        sender: {
          id: message.sender._id.toString(),
          name: (message.sender as unknown as PopulatedUser).name,
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
  
export const getUnreadCount = (messages: PopulatedMessage[], userId: string): number => 
    messages.filter(
      msg => !msg.read.includes(new Types.ObjectId(userId)) && 
            msg.sender._id.toString() !== userId
    ).length;
  
const getChatName = (chat: PopulatedChat, userId: string): string | undefined => {
  return chat.isGroupChat 
    ? (chat.groupId as PopulatedGroup)?.name 
    : (chat.participants.find((p: PopulatedUser) => p._id.toString() !== userId)?.name);
};

  
const formatLastMessage = (message: PopulatedMessage, userId: string): FormattedMessage | undefined => {
  if(!message) return undefined;
    return {
      messageId: message._id.toString(),
      content: message.content,
      timestamp: message.timestamp,
      formattedTime: formatTimestamp(message.timestamp),
      isRead: message.read.includes(new Types.ObjectId(userId)),
      read: message.read,
      sender: {
        id: message.sender._id.toString(),
        name: (message.sender as unknown as PopulatedUser).name,
        username: (message.sender as unknown as PopulatedUser).username
      }
    };
  };
  
  const getChatImage = (chat: PopulatedChat, userId: string): string | undefined => {
    return chat.isGroupChat ? (chat.groupId as PopulatedGroup)?.image : 
    chat.participants.find((p: PopulatedUser) => p._id.toString() !== userId)?.picture;
  }
  
const formatTimestamp = (timestamp: Date): string => 
     new Date(timestamp).toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
});

  