import { UnauthorizedError } from './errors';
import { CommentRepository } from '../repositories';

export const checkCommentOwner = async (commentId: string, userId: string) => {
  if ((await CommentRepository.getCommentById(commentId)).userId.toString() !== userId) {
    throw new UnauthorizedError('The user is not the owner of the comment');
  }
};
