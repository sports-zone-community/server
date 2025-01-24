import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';

import { createGroupSchema, joinGroupSchema } from '../validations/group.validation';
import { createAndSaveGroup, joinUserToGroup } from '../repository/group.repository';
import { IGroup } from '../models/group.model';

// TODO: in every function - next errors instead of sending them to res

export const createGroup = async (req: Request, res: Response) => {
  const { name, description, members } = req.body;
  const userId = req.user?.id;

  const { error } = createGroupSchema.validate(req.body);
  if (error) {
     res.status(StatusCodes.BAD_REQUEST).json({ error: error.details[0].message });
     return;
  }

  try {
    const group: IGroup | null = await createAndSaveGroup({name, description, members}, new Types.ObjectId(userId));

    res.status(StatusCodes.CREATED).json(group);
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    return;
  }
};

export const joinGroup = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { groupId } = req.params;

  const { error } = joinGroupSchema.validate({ groupId });
  if (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.details[0].message });
    return;
  }

  try {
    const group: IGroup | null = await joinUserToGroup(new Types.ObjectId(groupId), new Types.ObjectId(userId));
    
    res.status(StatusCodes.OK).json(group);
  } catch (error: any) {
    if (error.message === 'Group not found') {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Group not found' });
      return;
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    return;
  }
}; 