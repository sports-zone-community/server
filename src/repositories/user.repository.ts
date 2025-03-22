import { FilterQuery, UpdateQuery } from 'mongoose';
import { User, UserDocument, UserModel } from '../models';
import { assertExists } from '../utils';

const docType: string = UserModel.modelName;

export const getUserById = async (userId: string): Promise<UserDocument> =>
  assertExists((await UserModel.findById(userId)) as UserDocument, docType);

export const getUserByFilters = async (filters: FilterQuery<UserDocument>): Promise<UserDocument> =>
  assertExists((await UserModel.findOne(filters)) as UserDocument, docType);

export const updateUser = async (
  userId: string,
  userUpdate: Partial<UserDocument>,
): Promise<UserDocument> => assertExists((await UserModel.findByIdAndUpdate(userId, userUpdate)) as UserDocument, docType);

export const createUser = async (user: Partial<User>): Promise<UserDocument> =>
  await UserModel.create(user);

export const getOrCreateUser = async (user: Partial<User>): Promise<UserDocument> => {
  const existingUser: UserDocument | null = await UserModel.findOne({
    $or: [{ email: user.email }, { username: user.username }],
  });
  return existingUser || (await UserModel.create(user));
};

export const toggleFollow = async (
  selfUserId: string,
  otherUserId: string,
  isFollowing: boolean,
): Promise<UserDocument> => {
  const updateQuery: UpdateQuery<UserDocument> = isFollowing
    ? { $pull: { following: otherUserId } }
    : { $addToSet: { following: otherUserId } };
  return assertExists(
    (await UserModel.findByIdAndUpdate(selfUserId, updateQuery, { new: true })) as UserDocument,
    docType,
  );
};
