import { Document, model, Schema, Types  } from 'mongoose';

export interface IMessage {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  timestamp: Date;
  read: Types.ObjectId[];
  senderName?: string;
  formattedTime?: string;
}

export interface IChat extends Document {
  _id: Types.ObjectId;
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
    ref: 'User'
  }],
  isGroupChat: {
    type: Boolean,
    default: false
  },
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  },
  groupName: {
    type: String
  },
  messages: [messageSchema],
  lastMessage: messageSchema,
  chatName: {
    type: String
  }
});

export const Chat = model<IChat>('Chat', chatSchema); 