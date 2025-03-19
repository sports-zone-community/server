import { Request, Response } from 'express';
import { GroupDocument, GroupModel, UserDocument, UserModel } from '../models';
import { StatusCodes } from 'http-status-codes';
import { QuerySelector } from 'mongoose';
import { SearchResult } from '../utils';

export const search = async (req: Request, res: Response): Promise<void> => {
  const searchQuery = req.params.searchQuery as string;
  const filter: QuerySelector<string> = { $regex: searchQuery, $options: 'i' };

  const users: UserDocument[] = await UserModel.find({
    $or: [{ name: filter }, { username: filter }],
  });

  const groups: GroupDocument[] = await GroupModel.find({ name: filter });

  const results: SearchResult[] = [
    ...users.map(
      (user: UserDocument): SearchResult => ({
        name: user.name,
        image: user.picture,
        type: 'user',
      }),
    ),
    ...groups.map(
      (group: GroupDocument): SearchResult => ({
        name: group.name,
        image: group.image || '',
        type: 'group',
      }),
    ),
  ];

  console.log(results);

  res.status(StatusCodes.OK).json(results);
};
