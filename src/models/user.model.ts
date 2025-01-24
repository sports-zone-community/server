import { model, Model, Schema, Document } from 'mongoose';

// TODO: User should have an array of groups and an array of chats he is in?

export interface User {
  username: string;
  password: string;
  email: string;
  fullName: string;
  tokens: string[];
  groups: Schema.Types.ObjectId[];
}

export type UserDocument = User & Document;

const userSchema = new Schema<UserDocument>({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  tokens: {
    type: [String],
    default: [],
  },
  groups: [{
    type: Schema.Types.ObjectId,
    ref: 'Group'
  }]
});

export const UserModel: Model<UserDocument> = model<UserDocument>('User', userSchema);
