import { Request, Response } from 'express';
import { BadRequestError, deleteFile, isFollowingUser, LoggedUser } from '../utils';
import { UserDocument } from '../models';
import { StatusCodes } from 'http-status-codes';
import { UserRepository } from '../repositories';
import path from 'path';
import { Provider } from '../utils/enums/provider.enum';

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

  const { password, tokens, ...userWithoutSensitiveData } = user.toObject();

  res.status(StatusCodes.OK).json(userWithoutSensitiveData);
};

export const getUserDetailsById = async (req: Request, res: Response) => {
  const userId: string = req.query.userId as string;
  const user: UserDocument = await UserRepository.getUserById(userId);

  const { password, tokens, ...userWithoutSensitiveData } = user.toObject();

  res.status(StatusCodes.OK).json(userWithoutSensitiveData);
};

export const updateUser = async (req: Request, res: Response) => {
  const { id }: LoggedUser = req.user;
  const userUpdate = JSON.parse(JSON.stringify(req.body));
  const picture = req.file;

  if (picture) {
    const user: UserDocument = await UserRepository.getUserById(id);
    if (
      user.picture &&
      !user.picture.includes('anonymous-user.jpg') &&
      user.provider !== Provider.GOOGLE
    ) {
      await deleteFile(user.picture);
    }
    userUpdate.picture = path.join('uploads', picture.filename);
  }

  const updatedUser: UserDocument = await UserRepository.updateUser(id, userUpdate);

  const { password, tokens, ...userWithoutSensitiveData } = updatedUser.toObject();

  res.status(StatusCodes.OK).json(userWithoutSensitiveData);
};
