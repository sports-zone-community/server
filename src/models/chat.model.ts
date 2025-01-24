import { Document, model, Schema, Types  } from 'mongoose';
import { IMessage, messageSchema } from './message.model';

// TODO: Chat should not have participants?

export interface Chat extends Document {
  participants: Types.ObjectId[];
  isGroupChat: boolean;
  groupId?: Types.ObjectId;
  groupName?: string;
  messages: IMessage[];
  lastMessage?: IMessage;
  chatName?: string;
}

export const chatSchema = new Schema<Chat>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  isGroupChat: {
    type: Boolean,
    default: false,
    required: true
  },
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: function(this: Chat) {
      return this.isGroupChat;
    }
  },
  groupName: {
    type: String,
    required: function(this: Chat) {
      return this.isGroupChat;
    }
  },
  messages: {
    type: [messageSchema],
    default: []
  },
  lastMessage: messageSchema,
  chatName: {
    type: String
  }
});

export const ChatModel = model<Chat>('Chat', chatSchema); 