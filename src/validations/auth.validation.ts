import Joi, { ObjectSchema } from 'joi';
import { User } from '../models';
import { mongoIdSchema } from './common.validation';

export type RegisterObject = Pick<User, 'email' | 'name' | 'password' | 'username'>;

export const registerSchema: ObjectSchema<RegisterObject> = Joi.object<RegisterObject>({
  email: Joi.string().email().required(),
  name: Joi.string().required().min(3).max(40),
  password: Joi.string().required().min(6).max(30),
  username: Joi.string().required().min(3).max(20),
});

export type LoginObject = Pick<User, 'email' | 'password'>;

export const loginSchema: ObjectSchema<LoginObject> = Joi.object<LoginObject>({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(30),
});

export type GoogleLoginObject = { access_token: string };

export const googleLoginSchema: ObjectSchema<GoogleLoginObject> = Joi.object<GoogleLoginObject>({
  access_token: Joi.string().required(),
});

export type GoogleUser = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
};

export const googleUserSchema: ObjectSchema<GoogleUser> = Joi.object<GoogleUser>({
  id: Joi.string().required(),
  email: Joi.string().email().required(),
  verified_email: Joi.boolean().required(),
  name: Joi.string().required().min(3).max(40),
  given_name: Joi.string().required().min(3).max(20),
  family_name: Joi.string().required().min(3).max(20),
  picture: Joi.string().required(),
});

export interface UserIdParams {
  userId: string;
}

export const userIdSchema: Joi.ObjectSchema<UserIdParams> = Joi.object<UserIdParams>({
  userId: mongoIdSchema,
});
