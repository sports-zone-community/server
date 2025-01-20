import { Chat, IChat } from '../models/chat.model';
import { Group, IGroup } from '../models/group.model';
import { User } from '../models/user.model';
import { Types } from 'mongoose';

export const createAndSaveGroup = async (
  groupData: {name: string, description: string, members: Types.ObjectId[]},
  userId: Types.ObjectId,
): Promise<IGroup> => {
  try {
    const group: IGroup = await Group.create({
      name: groupData.name,
      description: groupData.description,
      creator: userId,
      members: [...groupData.members, userId],
      admins: [userId]
    });
    
    const chatData = {
      isGroupChat: true,
      groupId: group._id as string,
      groupName: groupData.name,
      participants: [...groupData.members, userId],
      messages: []
    };
    
    await Promise.all([
      Chat.create(chatData),
      User.updateMany(
        { _id: { $in: [...groupData.members, userId] }},
        { $push: { groups: group._id }}
      )
    ]);

    return group;
  } catch (error) {
    throw error;
  }
};

export const joinUserToGroup = async (groupId: Types.ObjectId, userId: Types.ObjectId): Promise<IGroup | null> => {
  try {
    const group: IGroup | null = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: userId } },
      { new: true }
    );

    if (!group) {
      throw new Error('Group not found');
    }

    await Promise.all([
      User.findByIdAndUpdate(userId, { $addToSet: { groups: groupId } }),
      Chat.findOneAndUpdate({ groupId: groupId }, { $addToSet: { participants: userId } })
    ]);
    
    return group;
  } catch (error) {
    throw error;
  }
};