import { PopulatedUser } from './Populated';
import { Types } from 'mongoose';

export interface FormattedChat {
    chatId: string;
    lastMessage: FormattedMessage;
    unreadCount: number;
    chatName?: string;
    isGroupChat?: boolean;
    groupName?: string;
    groupId?: string;
    participants?: PopulatedUser[];
    messages?: FormattedMessage[];
}

export interface FormattedMessage {
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