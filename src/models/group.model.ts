import { Document, model, Schema, Types } from 'mongoose';

// TODO: Group should not hold the members, it should be only in User

export interface Group {
  name: string;
  description?: string;
  creator: Types.ObjectId;
  admins: Types.ObjectId[];
  members: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
}

export type GroupDocument = Group & Document;

const groupSchema = new Schema<GroupDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    avatar: {
      type: String,
    },
  },
  { timestamps: true },
);

groupSchema.pre('save', function (next) {
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

export const GroupModel = model<GroupDocument>('Group', groupSchema);
