import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Group } from '../models/group.model';
import { User } from '../models/user.model';
import { Chat } from '../models/chat.model';
import { createGroupSchema, joinGroupSchema } from '../validator/group.validator';
import { logEndFunction, logStartFunction } from '../utils/utils';


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
    const group = await Group.create({
      name,
      description,
      creator: userId,
      members: [...members, userId],
      admins: [userId]
    });

    await Chat.create({
      isGroupChat: true,
      groupId: group._id,
      groupName: name,
      participants: [...members, userId]
    });

    await User.updateMany(
      { _id: { $in: [...members, userId] }},
      { $push: { groups: group._id }}
    );

    logEndFunction('createGroup');
    res.status(StatusCodes.CREATED).json(group);
  } catch (error: any) {
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
    const group = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: userId } },
      { new: true }
    );

    if (!group) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Group not found' });
      return;
    }

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { groups: groupId } }
    );

    await Chat.findOneAndUpdate(
      { groupId: groupId },
      { $addToSet: { participants: userId } }
    );

    logEndFunction('joinGroup');
     res.status(StatusCodes.OK).json(group);
  } catch (error: any) {
     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
     return;
  }
}; 