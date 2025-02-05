import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CreateGroupObject } from '../validations';
import { GroupDocument } from '../models';
import { getObjectId, LoggedUser } from '../utils';
import { GroupRepository } from '../repositories';
import { isUserJoinedGroup } from '../utils/group.utils';

export const createGroup = async (req: Request, res: Response) => {
  const { id }: LoggedUser = req.user;
  const { name, description, avatar }: CreateGroupObject = req.body;

  const group: GroupDocument = await GroupRepository.createGroup({
    name,
    description,
    avatar,
    creator: getObjectId(id),
    members: [getObjectId(id)],
  });

  res.status(StatusCodes.CREATED).json(group);
};

export const toggleJoinGroup = async (req: Request, res: Response) => {
  const { id }: LoggedUser = req.user;
  const groupId: string = req.params.groupId;

  const group: GroupDocument = await GroupRepository.toggleJoinGroup(
    groupId,
    id,
    await isUserJoinedGroup(id, groupId),
  );

  res.status(StatusCodes.OK).json(group);
};
