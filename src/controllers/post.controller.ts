import { NextFunction, Request, Response } from 'express';
import { BadRequestError, LoggedUser } from '../utils';
import { CreatePostObject, UpdatePostObject } from '../validations/post.validation';
import * as PostRepository from '../repositories/post.repository';
import { Types } from 'mongoose';
import { GroupModel, GroupDocument, PostDocument } from '../models';
import { StatusCodes } from 'http-status-codes';
import { checkPostOwner, isPostLikedByUser } from '../utils/post.utils';
import { assertExists } from '../utils/functions/common.functions';

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  const { id }: LoggedUser = req.user;
  const { content, image, groupId }: CreatePostObject = req.body as CreatePostObject;

  try {
    // TODO: Should be group repo function
    const group: GroupDocument = assertExists(await GroupModel.findById(groupId), 'Group');
    if (!group.members.includes(new Types.ObjectId(id))) {
      throw new BadRequestError('Cannot upload a post to a group that the user is not a part of');
    }
    // TODO: Add a validation to make sure the user is already in the group
    const post: PostDocument = await PostRepository.createPost({
      userId: new Types.ObjectId(id),
      content,
      image,
      groupId: new Types.ObjectId(groupId),
    });
    res.status(StatusCodes.CREATED).json({ post });
  } catch (error: unknown) {
    return next(error);
  }
};

export const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  const id: string = req.params.postId;

  try {
    const post: PostDocument = await PostRepository.getPostById(id);
    res.status(StatusCodes.OK).json(post);
  } catch (error: unknown) {
    return next(error);
  }
};

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  const { id }: LoggedUser = req.user;
  const { postId } = req.params;

  try {
    await checkPostOwner(postId, id);
    const post: PostDocument = await PostRepository.updatePost(
      postId,
      req.body as UpdatePostObject,
    );
    res.status(StatusCodes.OK).json(post);
  } catch (error: unknown) {
    return next(error);
  }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  const { id }: LoggedUser = req.user;
  const { postId } = req.params;

  try {
    await checkPostOwner(postId, id);
    await PostRepository.deletePost(postId);
    res.status(StatusCodes.NO_CONTENT).json({ message: 'Post deleted successfully' });
  } catch (error: unknown) {
    return next(error);
  }
};

export const likePost = async (req: Request, res: Response, next: NextFunction) => {
  const { id }: LoggedUser = req.user;
  const { postId } = req.params;

  try {
    if (await isPostLikedByUser(postId, id)) {
      throw new BadRequestError('The user has already liked this post');
    }
    const post: PostDocument = await PostRepository.likePost(postId, id);
    res.status(StatusCodes.OK).json(post);
  } catch (error: unknown) {
    return next(error);
  }
};

export const unlikePost = async (req: Request, res: Response, next: NextFunction) => {
  const { id }: LoggedUser = req.user;
  const { postId } = req.params;

  try {
    if (!(await isPostLikedByUser(postId, id))) {
      throw new BadRequestError('Cannot unlike a post that the user has not liked');
    }
    const post: PostDocument = await PostRepository.unlikePost(postId, id);
    res.status(StatusCodes.OK).json(post);
  } catch (error: unknown) {
    return next(error);
  }
};

export const getLikedPosts = async (req: Request, res: Response, next: NextFunction) => {
  const { id }: LoggedUser = req.user;

  try {
    const likedPosts: PostDocument[] = await PostRepository.getLikedPosts(id);
    res.status(StatusCodes.OK).json(likedPosts);
  } catch (error: unknown) {
    return next(error);
  }
};
