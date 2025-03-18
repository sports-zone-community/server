import { Chat, ChatModel, Group, GroupDocument, GroupModel } from '../models';
import { UpdateQuery } from 'mongoose';
import { assertExists } from '../utils';

const docType: string = 'Group';

export const createGroup = async (group: Partial<Group>): Promise<GroupDocument> => {
  const newGroup: GroupDocument = await GroupModel.create(group);

  await ChatModel.create({
    isGroupChat: true,
    groupId: newGroup._id as string,
    groupName: newGroup.name,
    participants: [...newGroup.members],
    messages: [],
  });

  return newGroup;
};

export const getGroupById = async (groupId: string): Promise<GroupDocument> =>
  assertExists((await GroupModel.findById(groupId)) as GroupDocument, docType);

export const getGroupsByUserId = async (userId: string): Promise<GroupDocument[]> =>
  await GroupModel.find({ members: { $in: [userId] } });

export const toggleJoinGroup = async (
  groupId: string,
  userId: string,
  isJoined: boolean,
): Promise<GroupDocument> => {
  const groupUpdateQuery: UpdateQuery<GroupDocument> = isJoined
    ? { $pull: { members: userId } }
    : { $addToSet: { members: userId } };
  const group: GroupDocument = assertExists(
    (await GroupModel.findByIdAndUpdate(groupId, groupUpdateQuery, { new: true })) as GroupDocument,
    docType
  );

  const chatUpdateQuery: UpdateQuery<Chat> = isJoined
    ? { $pull: { participants: userId } }
    : { $addToSet: { participants: userId } };
  await ChatModel.findOneAndUpdate({ groupId: groupId }, chatUpdateQuery);

  return group;
};
