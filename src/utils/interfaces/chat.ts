import { PopulatedUser } from './Populated';
import { Types } from 'mongoose';

export interface Chat {
    chatId: string;
    lastMessage: Message;
    unreadCount: number;
    chatName?: string;
    isGroupChat?: boolean;
    groupName?: string;
    groupId?: string;
    participants?: PopulatedUser[];
    messages?: Message[];
}

export interface Message {
    messageId: string;
    sender: {
        id: string;
        name: string;
        username: string;
    };
    formattedTime: string;
    content: string;
    timestamp: Date;
    isRead: boolean;
    read: Types.ObjectId[];
}