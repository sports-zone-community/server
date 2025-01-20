import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';

import { createGroupSchema, joinGroupSchema } from '../validations/group.validation';
import { logEndFunction, logError, logStartFunction } from '../utils/utils';
import { createAndSaveGroup, joinUserToGroup } from '../repository/group.repository';
import { IGroup } from '../models/group.model';


export const createGroup = async (req: Request, res: Response) => {
  const { name, description, members } = req.body;
  const userId = req.user?.id;
  logStartFunction('createGroup');

  const { error } = createGroupSchema.validate(req.body);
  if (error) {
     res.status(StatusCodes.BAD_REQUEST).json({ error: error.details[0].message });
     return;
  }

  try {
    const group: IGroup | null = await createAndSaveGroup({name, description, members}, new Types.ObjectId(userId));

    logEndFunction('createGroup');
    res.status(StatusCodes.CREATED).json(group);
  } catch (error: any) {
    logError(error.message, 'createGroup');
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    return;
  }
};

export const joinGroup = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { groupId } = req.params;
  logStartFunction('joinGroup');
  
  const { error } = joinGroupSchema.validate({ groupId });
  if (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.details[0].message });
    return;
  }

  try {
    const group: IGroup | null = await joinUserToGroup(new Types.ObjectId(groupId), new Types.ObjectId(userId));
    
    logEndFunction('joinGroup');
    res.status(StatusCodes.OK).json(group);
  } catch (error: any) {
    if (error.message === 'Group not found') {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Group not found' });
      return;
    }

    logError(error.message, 'joinGroup');
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    return;
  }
}; 