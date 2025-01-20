import { Document, model, Schema, Types  } from 'mongoose';
import { IMessage } from './message.model';


export interface IChat extends Document {
  participants: Types.ObjectId[];
  isGroupChat: boolean;
  groupId?: Types.ObjectId;
  groupName?: string;
  messages: IMessage[];
  lastMessage?: IMessage;
  chatName?: string;
}

  const messageSchema = new Schema<IMessage>({
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderName: {
      type: String
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: [Schema.Types.ObjectId],
      default: []
    }
  });

const chatSchema = new Schema<IChat>({
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
    required: function(this: IChat) {
      return this.isGroupChat;
    }
  },
  groupName: {
    type: String,
    required: function(this: IChat) {
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

export const Chat = model<IChat>('Chat', chatSchema); 