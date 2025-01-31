import { Post, PostDocument, PostModel } from '../models';
import { assertExists, getObjectId } from '../utils/functions/common.functions';
import { UpdatePostObject } from '../validations';

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
  const updateQuery = isLiked ? { $push: { likes: userId } } : { $pull: { likes: userId } };
  return assertExists(
    (await PostModel.findByIdAndUpdate(postId, updateQuery, { new: true })) as PostDocument,
    docType,
  );
};

export const getPostsByUserId = async (userId: string): Promise<PostDocument[]> =>
  await PostModel.find({ userId: getObjectId(userId) });
