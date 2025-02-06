import { Comment, CommentDocument, CommentModel } from '../models';
import { assertExists } from '../utils';

const docType: string = CommentModel.modelName;

export const getCommentById = async (commentId: string): Promise<CommentDocument> =>
  assertExists((await CommentModel.findById(commentId)) as CommentDocument, docType);

export const getCommentsByPostId = async (postId: string): Promise<CommentDocument[]> =>
  await CommentModel.find({ postId });

export const addComment = async (comment: Comment): Promise<CommentDocument> =>
  await CommentModel.create(comment);

export const deleteComment = async (commentId: string): Promise<CommentDocument> =>
  assertExists((await CommentModel.findByIdAndDelete(commentId)) as CommentDocument, docType);
