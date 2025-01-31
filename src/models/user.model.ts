import { Document, Model, model, Schema } from 'mongoose';
import { Provider } from '../enums/provider.enum';

// TODO: User should have an array of groups and an array of chats he is in?

export interface User {
  username: string;
  password: string;
  email: string;
  name: string;
  tokens: string[];
  googleId: string;
  picture: string;
  provider: Provider;
  groups: Schema.Types.ObjectId[];
}

export type UserDocument = User & Document;

const userSchema = new Schema<UserDocument>({
  username: {
    type: String,
    required: true,
    unique: [true, 'Username is already taken'],
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: [true, 'Email is already taken'],
  },
  name: {
    type: String,
    required: true,
  },
  tokens: {
    type: [String],
    default: [],
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  picture: {
    type: String,
  },
  provider: {
    type: String,
    required: true,
    enum: Object.values(Provider),
    default: Provider.LOCAL,
  },
  groups: [

      {
      type: Schema.Types.ObjectId,
      ref: 'Group',
    },
  ],
});

export const UserModel: Model<UserDocument> = model<UserDocument>('User', userSchema);
