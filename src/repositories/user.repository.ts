import { UserDocument, UserModel } from '../models';
import { InternalServerError, NotFoundError } from '../utils';
import { FilterQuery } from 'mongoose';

export const getUserById = async (userId: string): Promise<UserDocument> => {
  const user: UserDocument | null = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

export const getUserByFilters = async (
  filters: FilterQuery<UserDocument>,
): Promise<UserDocument> => {
  const user: UserDocument | null = await UserModel.findOne(filters);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

export const updateUser = async (
  userId: string,
  userUpdate: Partial<UserDocument>,
): Promise<UserDocument> => {
  const user: UserDocument | null = await UserModel.findByIdAndUpdate(userId, userUpdate);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

export const createUser = async (user: Partial<UserDocument>): Promise<UserDocument> => {
  try {
    return await UserModel.create(user);
  } catch (error: any) {
    throw new InternalServerError(error.message);
  }
};
