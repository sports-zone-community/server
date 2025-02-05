import { GroupRepository } from '../repositories';
import { getObjectId } from './common.utils';

export const isUserJoinedGroup = async (userId: string, groupId: string): Promise<boolean> =>
  (await GroupRepository.getGroupById(groupId)).members.includes(getObjectId(userId));
