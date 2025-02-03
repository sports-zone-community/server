import { PostRepository } from '../repositories';
import { ForbiddenError } from './errors';
import { Types } from 'mongoose';

export const checkPostOwner = async (postId: string, userId: string) => {
  if ((await PostRepository.getPostById(postId)).userId.toString() !== userId) {
    throw new ForbiddenError('You are not the owner of this post');
  }
};

export const isPostLikedByUser = async (postId: string, userId: string): Promise<boolean> => {
  return (await PostRepository.getPostById(postId)).likes.some(
    (id: Types.ObjectId) => id.toString() === userId,
  );
};
