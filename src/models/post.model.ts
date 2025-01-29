import { Model, model, Schema, Types, Document } from 'mongoose';

export interface Post {
  content: string;
  image: string;
  userId: Types.ObjectId;
  groupId: Types.ObjectId;
  likes: Types.ObjectId[];
}

export type PostDocument = Post & Document;

const postSchema = new Schema<PostDocument>(
  {
    content: { type: String, required: true },
    image: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    likes: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
  },
  { timestamps: true },
);

export const PostModel: Model<PostDocument> = model<PostDocument>('Post', postSchema);
