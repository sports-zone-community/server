import { IUser, UserModel } from '../models';
import { NotFoundError } from '../utils/errors';
import { FilterQuery } from 'mongoose';
import { InternalServerError } from '../utils/errors/internal-server.error';

export const getUserById = async (userId: string): Promise<IUser> => {
  const user: IUser | null = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found', { functionName: 'Change me' });
  }

  return user;
};

export const getUserByFilters = async (filters: FilterQuery<IUser>): Promise<IUser> => {
  const user: IUser | null = await UserModel.findOne(filters);
  if (!user) {
    throw new NotFoundError('User not found', { functionName: 'Change me' });
  }

  return user;
};

export const updateUser = async (userId: string, userUpdate: Partial<IUser>): Promise<IUser> => {
  const user: IUser | null = await UserModel.findByIdAndUpdate(userId, userUpdate);
  if (!user) {
    throw new NotFoundError('User not found', { functionName: 'Change me' });
  }

  return user;
};

export const createUser = async (user: Partial<IUser>): Promise<IUser> => {
  try {
    return await UserModel.create(user);
  } catch (error: any) {
    throw new InternalServerError(error.message, { functionName: 'Change me' });
  }
};
