import Joi, { ObjectSchema } from 'joi';
import { User } from '../../models';

export type RegisterObject = Omit<User, 'tokens'>;

export const registerSchema: ObjectSchema<RegisterObject> = Joi.object({
  email: Joi.string().email().required(),
  fullName: Joi.string().required().min(3).max(40),
  password: Joi.string().required().min(6).max(30),
  username: Joi.string().required().min(3).max(20),
});

export type LoginObject = Pick<User, 'email' | 'password'>;

export const loginSchema: ObjectSchema<LoginObject> = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(30),
});
