import { Document, Model, model, Schema, Types } from 'mongoose';
import { Provider } from '../utils/enums/provider.enum';

export interface User {
  username: string;
  password: string;
  email: string;
  name: string;
  tokens: string[];
  googleId?: string;
  picture: string;
  provider: Provider;
  following: Types.ObjectId[];
}

export type UserDocument = User & Document;

const userSchema: Schema<UserDocument> = new Schema<UserDocument>({
  username: { type: String, required: true, unique: [true, 'Username is already taken'] },
  password: { type: String },
  email: { type: String, required: true, unique: [true, 'Email is already taken'] },
  name: { type: String, required: true },
  tokens: { type: [String], default: [] },
  googleId: { type: String, sparse: true, unique: true },
  picture: { type: String, default: '' },
  provider: {
    type: String,
    required: true,
    enum: Object.values(Provider),
    default: Provider.LOCAL,
  },
  following: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
});

export const UserModel: Model<UserDocument> = model<UserDocument>('User', userSchema);
