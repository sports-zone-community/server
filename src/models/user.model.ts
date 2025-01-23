import { model, Model, Schema, Document } from 'mongoose';

export interface User {
  username: string;
  password: string;
  email: string;
  fullName: string;
  tokens: string[];
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
});

export const UserModel: Model<UserDocument> = model<UserDocument>('User', userSchema);
