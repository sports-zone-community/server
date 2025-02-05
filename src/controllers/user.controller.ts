import { Request, Response } from 'express';
import { BadRequestError, isFollowingUser, LoggedUser } from '../utils';
import { UserDocument } from '../models';
import { StatusCodes } from 'http-status-codes';
import { UserRepository } from '../repositories';

export const toggleFollow = async (req: Request, res: Response) => {
  const { id }: LoggedUser = req.user;
  const targetUserId: string = req.params.userId;

  if (id === targetUserId) {
    throw new BadRequestError('You cannot follow yourself');
  }

  const user: UserDocument = await UserRepository.toggleFollow(
    id,
    targetUserId,
    await isFollowingUser(id, targetUserId),
  );

  res.status(StatusCodes.OK).json(user);
};
