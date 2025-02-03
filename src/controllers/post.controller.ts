import { Request, Response } from 'express';
import {
  BadRequestError,
  checkPostOwner,
  getObjectId,
  isPostLikedByUser,
  LoggedUser,
} from '../utils';
import { CreatePostObject, UpdatePostObject } from '../validations';
import { GroupRepository, PostRepository } from '../repositories';
import { GroupDocument, PostDocument } from '../models';
import { StatusCodes } from 'http-status-codes';

export const createPost = async (req: Request, res: Response) => {
  const { id }: LoggedUser = req.user;
  const { content, image, groupId }: CreatePostObject = req.body as CreatePostObject;

  if (groupId) {
    const group: GroupDocument = await GroupRepository.getGroupById(groupId.toString());
    if (!group.members.includes(getObjectId(id))) {
      throw new BadRequestError('Cannot upload a post to a group that the user is not a part of');
    }
  }

  const post: PostDocument = await PostRepository.createPost({
    userId: getObjectId(id),
    content,
    image,
    groupId: groupId,
  });

  res.status(StatusCodes.CREATED).json(post);
};

export const getPostById = async (req: Request, res: Response) => {
  const postId: string = req.params.postId;
  const post: PostDocument = await PostRepository.getPostById(postId);

  res.status(StatusCodes.OK).json(post);
};

export const updatePost = async (req: Request, res: Response) => {
  const { id }: LoggedUser = req.user;
  const postId: string = req.params.postId;

  await checkPostOwner(postId, id);
  const post: PostDocument = await PostRepository.updatePost(postId, req.body as UpdatePostObject);

  res.status(StatusCodes.OK).json(post);
};

export const deletePost = async (req: Request, res: Response) => {
  const { id }: LoggedUser = req.user;
  const postId: string = req.params.postId;

  await checkPostOwner(postId, id);
  await PostRepository.deletePost(postId);

  res.status(StatusCodes.OK).json({ message: 'Post deleted successfully' });
};

export const toggleLike = async (req: Request, res: Response) => {
  const { id }: LoggedUser = req.user;
  const postId: string = req.params.postId;

  const post: PostDocument = await PostRepository.toggleLike(
    postId,
    id,
    await isPostLikedByUser(postId, id),
  );

  res.status(StatusCodes.OK).json(post);
};

export const getPostsByUserId = async (req: Request, res: Response) => {
  const { id }: LoggedUser = req.user;
  const ownPosts: PostDocument[] = await PostRepository.getPostsByUserId(id);

  res.status(StatusCodes.OK).json(ownPosts);
};

export const getExplorePosts = async (req: Request, res: Response) => {
  const { id }: LoggedUser = req.user;
  const page: number = Number(req.query.page);
  const posts: PostDocument[] = await PostRepository.getExplorePosts(id, page);

  res.status(StatusCodes.OK).json(posts);
};
