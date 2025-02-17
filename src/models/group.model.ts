import { Document, Model, model, Schema, Types } from 'mongoose';

export interface Group {
  name: string;
  description: string;
  creator: Types.ObjectId;
  members: Types.ObjectId[];
  image?: string;
}

export type GroupDocument = Group & Document;

const groupSchema: Schema<GroupDocument> = new Schema<GroupDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    image: { type: String },
  },
  { timestamps: true },
);

groupSchema.pre('save', function (next) {
  if (this.isNew && !this.members.includes(this.creator)) {
    this.members = [this.creator];
  }
  next();
});

export const GroupModel: Model<GroupDocument> = model<GroupDocument>('Group', groupSchema);
