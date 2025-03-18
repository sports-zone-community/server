import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CreateGroupObject } from '../validations';
import { GroupDocument } from '../models';
import { getObjectId, LoggedUser } from '../utils';
import { GroupRepository } from '../repositories';
import { isUserJoinedGroup } from '../utils/group.utils';
import { getGroupsByUserId } from '../repositories/group.repository';
import path from 'path';

export const getGroups = async (req: Request, res: Response) => {
  const { id }: LoggedUser = req.user;
  const groups: GroupDocument[] = await getGroupsByUserId(id);

  res.status(StatusCodes.OK).json(groups);
};

export const createGroup = async (req: Request, res: Response) => {
  const { id }: LoggedUser = req.user;
  const { name, description }: CreateGroupObject = req.body;
  const image = req.file;
  const imagePath = image ? path.join('uploads', image.filename) : undefined;

  const group: GroupDocument = await GroupRepository.createGroup({
    name,
    description,
    image: imagePath,
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
