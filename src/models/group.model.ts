import { Document, model, Schema } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description?: string;
  creator: Schema.Types.ObjectId;
  admins: Schema.Types.ObjectId[];
  members: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
}

const groupSchema = new Schema<IGroup>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  avatar: {
    type: String
  }
}, {
  timestamps: true
});

groupSchema.pre('save', function(next) {
  if (this.isNew) {
    if (!this.admins.includes(this.creator)) {
      this.admins.push(this.creator);
    }
    if (!this.members.includes(this.creator)) {
      this.members.push(this.creator);
    }
  }
  next();
});

export const Group = model<IGroup>('Group', groupSchema); 