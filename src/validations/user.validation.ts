import { User } from '../models';
import Joi from 'joi';

export type UpdateUserObject = Pick<User, 'username' | 'name' | 'email'>;

export const updateUserSchema: Joi.ObjectSchema<UpdateUserObject> = Joi.object<UpdateUserObject, false>(
  {
    username: Joi.string().min(3).max(20).optional(),
    name: Joi.string().min(3).max(40).optional(),
    email: Joi.string().email().optional(),
  },
);
