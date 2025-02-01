import { UpdateQuery } from 'mongoose';
import { Post, PostDocument, PostModel, UserDocument } from '../models';
import { assertExists, getObjectId } from '../utils';
import { UpdatePostObject } from '../validations';
import * as UserRepository from './user.repository';
import { config } from '../config/config';

const docType: string = PostModel.modelName;

export const createPost = async (post: Partial<Post>): Promise<PostDocument> =>
  await PostModel.create(post);

export const getPostById = async (id: string): Promise<PostDocument> =>
  assertExists((await PostModel.findById(id)) as PostDocument, docType);

export const updatePost = async (id: string, postUpdate: UpdatePostObject): Promise<PostDocument> =>
  assertExists(
    (await PostModel.findByIdAndUpdate(id, postUpdate, { new: true })) as PostDocument,
    docType,
  );

export const deletePost = async (id: string): Promise<boolean> =>
  !!assertExists((await PostModel.findByIdAndDelete(id)) as PostDocument, docType);

export const toggleLike = async (
  postId: string,
  userId: string,
  isLiked: boolean,
): Promise<PostDocument> => {
  const updateQuery: UpdateQuery<PostDocument> = isLiked
    ? { $pull: { likes: userId } }
    : { $addToSet: { likes: userId } };
  return assertExists(
    (await PostModel.findByIdAndUpdate(postId, updateQuery, { new: true })) as PostDocument,
    docType,
  );
};

export const getPostsByUserId = async (userId: string): Promise<PostDocument[]> =>
  await PostModel.find({ userId: getObjectId(userId) });

export const getExplorePosts = async (userId: string, page: number): Promise<PostDocument[]> => {
  const user: UserDocument = await UserRepository.getUserById(userId);
  const limit: number = config.pageSize;

  return PostModel.find({
    $or: [{ userId: { $in: user.following } }, { groupId: { $in: user.groups } }],
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};
