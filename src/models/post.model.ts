import { Document, model, Model, Schema, Types } from 'mongoose';

export interface Post {
  content: string;
  image: string;
  userId: Types.ObjectId;
  groupId?: Types.ObjectId;
  likes: Types.ObjectId[];
}

export type PostDocument = Post & Document;

// TODO: Remove ref if never using .populate()
const postSchema = new Schema<PostDocument>(
  {
    content: { type: String, required: true },
    image: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
    likes: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
  },
  { timestamps: true },
);

export const PostModel: Model<PostDocument> = model<PostDocument>('Post', postSchema);
