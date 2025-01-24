import { Types } from 'mongoose';
import { Chat } from '../../models/chat.model';

export interface PopulatedUser {
    _id: Types.ObjectId;
    username: string;
    fullName: string;
}
  
export interface PopulatedGroup {
    _id: Types.ObjectId;
    name: string;
} 
  
export interface PopulatedMessage {
    _id: Types.ObjectId;
    sender: PopulatedUser;
    content: string;
    timestamp: Date;
    read: Types.ObjectId[];
 }

 export interface PopulatedChat extends Omit<Chat, 'participants' | 'groupId' | 'messages' | 'lastMessage'> {
    participants: PopulatedUser[];
    groupId: PopulatedGroup;
    messages: PopulatedMessage[];
    lastMessage?: PopulatedMessage;
  }
  