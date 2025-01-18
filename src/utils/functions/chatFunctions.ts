import { PopulatedUser } from '../interfaces/Populated';
import { Types } from 'mongoose';
import { PopulatedGroup } from '../interfaces/Populated';
  
export const processChatsData = (chats: any[], userId: string) => {
    return chats.map(chat => {
      const lastMessage = chat.messages[0];
      const unreadCount = getUnreadCount(chat.messages, userId);
  
      return {
        chatId: chat._id,
        chatName: getChatName(chat, userId),
        lastMessage: formatLastMessage(lastMessage, chat.isGroupChat),
        unreadCount
      };
    });
  };

  export const getUnreadChats = (chatsWithUnread: any[], userId: string) => {
    return chatsWithUnread.map(chat => {
      const unreadMsgs = chat.messages.filter(
        (msg: any) => !msg.read.includes(new Types.ObjectId(userId)) && 
              msg.sender.toString() !== userId
      );

      return {
        chatId: chat._id,
        isGroupChat: chat.isGroupChat,
        groupName: chat.isGroupChat ? (chat.groupId as PopulatedGroup)?.name : undefined,
        participants: chat.participants,
        unreadCount: unreadMsgs.length,
        lastMessage: unreadMsgs[unreadMsgs.length - 1]
      };
    });
  };

export const getUnreadCount = (messages: any[], userId: string) => {
    return messages.filter(
      msg => !msg.read.includes(new Types.ObjectId(userId)) && 
            msg.sender._id.toString() !== userId
    ).length;
  };
  
  const getChatName = (chat: any, userId: string) => {
    return chat.isGroupChat 
      ? (chat.groupId as PopulatedGroup)?.name 
      : (chat.participants.find((p: PopulatedUser) => p._id.toString() !== userId)?.fullName);
  };
  
export const formatLastMessage = (message: any, isGroupChat: boolean) => {
    if (!message) return undefined;
    
    return {
      content: message.content,
      senderName: isGroupChat ? (message.sender as PopulatedUser)?.fullName : undefined,
      timestamp: message.timestamp,
      formattedTime: formatTimestamp(message.timestamp)
    };
  };
  
export const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  export const sortMessages = (messages: any[], userId: string) => {
    return messages
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map(message => ({
        messageId: message._id,
        content: message.content,
        sender: {
          id: message.sender._id,
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
  