import { NextFunction, Request, Response } from 'express';
import { LoggedUser } from '../utils';
import { CreatePostObject, UpdatePostObject } from '../validations/post.validation';
import * as PostRepository from '../repositories/post.repository';
import { Types } from 'mongoose';
import { PostDocument } from '../models';
import { StatusCodes } from 'http-status-codes';

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  const { id }: LoggedUser = req.user;
  const { content, image, groupId }: CreatePostObject = req.body as CreatePostObject;

  try {
    const post: PostDocument = await PostRepository.createPost({
      userId: new Types.ObjectId(id),
      content,
      image,
      groupId: new Types.ObjectId(groupId),
    });
    res.status(StatusCodes.CREATED).json({ post });
  } catch (error: unknown) {
    next(error);
  }
};

export const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  const id: string = req.params.postId;
  try {
    const post: PostDocument = await PostRepository.getPostById(id);
    res.status(StatusCodes.OK).json({ post });
  } catch (error: unknown) {
    next(error);
  }
};

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;
  try {
    const post: PostDocument = await PostRepository.updatePost(
      postId,
      req.body as UpdatePostObject,
    );
    res.status(StatusCodes.OK).json({ post });
  } catch (error: unknown) {
    next(error);
  }
};
