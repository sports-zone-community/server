import { Document, model, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  fullName: string;
  tokens: string[];
}

const userSchema = new Schema<IUser>({
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

export const UserModel: Model<IUser> = model<IUser>('User', userSchema);
