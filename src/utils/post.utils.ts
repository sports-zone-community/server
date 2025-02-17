import { PostRepository } from '../repositories';
import { UnauthorizedError } from './errors';
import { Types } from 'mongoose';
import { deleteFile } from './common.utils';

export const checkPostOwner = async (postId: string, userId: string) => {
  if ((await PostRepository.getPostById(postId)).userId.toString() !== userId) {
    throw new UnauthorizedError('Not authorized');
  }
};

export const isPostLikedByUser = async (postId: string, userId: string): Promise<boolean> => {
  return (await PostRepository.getPostById(postId)).likes.some(
    (id: Types.ObjectId) => id.toString() === userId,
  );
};

export const deletePostImage = async (postId: string) => {
  const post = await PostRepository.getPostById(postId);
  try {
    await deleteFile(post.image);
  } catch (err) {
    console.log(err);
  }
};
