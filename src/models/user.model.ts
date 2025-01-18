import { Document, model, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  fullName: string;
  tokens: string[];
  groups: Schema.Types.ObjectId[];
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
  },
  groups: [{
    type: Schema.Types.ObjectId,
    ref: 'Group'
  }]
});

export const User = model<IUser>('User', userSchema);
