import { Types } from 'mongoose';

export interface PopulatedUser {
    _id: Types.ObjectId;
    username: string;
    fullName: string;
}
  
export interface PopulatedGroup {
    _id: Types.ObjectId;
    name: string;
} 

export interface PopulatedChat {
    _id: Types.ObjectId;
    participants: PopulatedUser[];
    isGroupChat: boolean;
    groupId?: PopulatedGroup;
    messages: PopulatedMessage[];
    lastMessage?: PopulatedMessage;
}
  
export interface PopulatedMessage {
    sender: PopulatedUser;
    content: string;
    timestamp: Date;
    read: Types.ObjectId[];
 }
  