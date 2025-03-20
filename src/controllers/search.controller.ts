import { Request, Response } from 'express';
import { GroupDocument, GroupModel, UserDocument, UserModel } from '../models';
import { StatusCodes } from 'http-status-codes';
import { QuerySelector } from 'mongoose';
import { LoggedUser, SearchResult } from '../utils';

export const search = async (req: Request, res: Response): Promise<void> => {
  const { id }: LoggedUser = req.user;
  const searchQuery = req.params.searchQuery as string;
  const filter: QuerySelector<string> = { $regex: searchQuery, $options: 'i' };

  const users: UserDocument[] = await UserModel.find({
    $or: [{ name: filter }, { username: filter }],
    _id: { $ne: id }
  });

  const groups: GroupDocument[] = await GroupModel.find({ name: filter });

  const results: SearchResult[] = [
    ...users.map(
      (user: UserDocument): SearchResult => ({
        id: user.id,
        name: user.name,
        image: user.picture,
        type: 'user',
      }),
    ),
    ...groups.map(
      (group: GroupDocument): SearchResult => ({
        id: group.id,
        name: group.name,
        image: group.image || '',
        type: 'group',
      }),
    ),
  ];

  res.status(StatusCodes.OK).json(results);
};
