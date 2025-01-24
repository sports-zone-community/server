import { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
    sender: Types.ObjectId;
    content: string;
    timestamp: Date;
    read: Types.ObjectId[];
    senderName?: string;
    formattedTime?: string;
  }

export const messageSchema = new Schema<IMessage>({
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