import { Document, model, Model, Schema, Types } from 'mongoose';

export interface Comment {
  content: string;
  userId: Types.ObjectId;
  postId: Types.ObjectId;
}

export type CommentDocument = Comment & Document;

// TODO: Remove ref if never using .populate()
const commentSchema = new Schema<CommentDocument>(
  {
    content: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  },
  { timestamps: true },
);

export const CommentModel: Model<CommentDocument> = model<CommentDocument>(
  'Comment',
  commentSchema,
);
