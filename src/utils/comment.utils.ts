import { ForbiddenError } from './errors';
import { CommentRepository } from '../repositories';

export const checkCommentOwner = async (commentId: string, userId: string) => {
  if ((await CommentRepository.getCommentById(commentId)).userId.toString() !== userId) {
    throw new ForbiddenError('You are not the owner of this comment');
  }
};
