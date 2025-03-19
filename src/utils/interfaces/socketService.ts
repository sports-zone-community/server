import { Types } from 'mongoose';

export interface ChatEvent {
    chatId: Types.ObjectId;
    message: {
      content: string;
      timestamp: Date;
      sender: string;
    }
}
  
  export interface JoinGroupEvent {
    groupId: Types.ObjectId;
    userId: Types.ObjectId;
}

export interface JoinPrivateChatEvent {
    userId: Types.ObjectId;
    toUserId: Types.ObjectId;
}