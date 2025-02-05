import { Request, Response } from 'express';
import { CreateCommentObject } from '../validations';
import { CommentRepository, PostRepository } from '../repositories';
import { checkCommentOwner, getObjectId, LoggedUser } from '../utils';
import { CommentDocument } from '../models';
import { StatusCodes } from 'http-status-codes';

export const getCommentsByPostId = async (req: Request, res: Response) => {
  const postId: string = req.query.postId as string;

  const comments: CommentDocument[] = await CommentRepository.getCommentsByPostId(postId);
  res.status(StatusCodes.OK).json(comments);
};

export const addComment = async (req: Request, res: Response) => {
  const { id }: LoggedUser = req.user;
  const { postId, content }: CreateCommentObject = req.body as CreateCommentObject;

  await PostRepository.getPostById(postId.toString());
  const comment: CommentDocument = await CommentRepository.addComment({
    postId,
    content,
    userId: getObjectId(id),
  });

  res.status(StatusCodes.CREATED).json(comment);
};

export const deleteComment = async (req: Request, res: Response) => {
  const { id }: LoggedUser = req.user;
  const commentId: string = req.params.commentId;

  await checkCommentOwner(commentId, id);
  await CommentRepository.deleteComment(commentId);

  res.status(StatusCodes.OK).json('Comment was deleted');
};
