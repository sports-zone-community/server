import { Post, PostDocument, PostModel } from '../models';
import { InternalServerError } from '../utils';
import { assertExists } from '../utils/functions/common.functions';

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

export const updatePost = async (id: string, postUpdate: Partial<Post>): Promise<PostDocument> =>
  assertExists((await PostModel.findByIdAndUpdate(id, postUpdate)) as PostDocument, docType);

export const deletePost = async (id: string): Promise<PostDocument> =>
  assertExists((await PostModel.findByIdAndDelete(id)) as PostDocument, docType);
