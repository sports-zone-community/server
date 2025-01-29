import { Post, PostDocument, PostModel } from '../models';
import { InternalServerError } from '../utils';
import { assertExists } from '../utils/functions/common.functions';
import { FilterQuery, Types } from 'mongoose';
import { UpdatePostObject } from '../validations/post.validation';

const docType: string = 'Post';

export const createPost = async (post: Partial<Post>): Promise<PostDocument> => {
  try {
    return await PostModel.create(post);
  } catch (error: any) {
    throw new InternalServerError(error.message);
  }
};

export const getPostById = async (id: string): Promise<PostDocument> =>
  assertExists((await PostModel.findById(id)) as PostDocument, docType);

export const updatePost = async (id: string, postUpdate: UpdatePostObject): Promise<PostDocument> =>
  assertExists(
    (await PostModel.findByIdAndUpdate(id, postUpdate, { new: true })) as PostDocument,
    docType,
  );

export const deletePost = async (id: string): Promise<boolean> =>
  !!assertExists((await PostModel.findByIdAndDelete(id)) as PostDocument, docType);

export const getPostsByFilters = async (filter: FilterQuery<Post>): Promise<PostDocument[]> =>
  await PostModel.find(filter);

export const getPostByFilters = async (filters: FilterQuery<Post>): Promise<PostDocument> =>
  assertExists((await PostModel.findOne(filters)) as PostDocument, docType);

export const likePost = async (postId: string, userId: string): Promise<PostDocument> =>
  assertExists(
    (await PostModel.findByIdAndUpdate(
      postId,
      {
        $push: { likes: userId },
      },
      { new: true },
    )) as PostDocument,
    docType,
  );

export const unlikePost = async (postId: string, userId: string): Promise<PostDocument> =>
  assertExists(
    (await PostModel.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: userId },
      },
      { new: true },
    )) as PostDocument,
    docType,
  );

export const getLikedPosts = async (userId: string): Promise<PostDocument[]> =>
  await PostModel.find({ likes: { $in: [new Types.ObjectId(userId)] } });
