import Joi from 'joi';
import { mongoIdSchema } from './common.validation';

export const createGroupSchema = Joi.object({
  name: Joi.string().required().min(2).max(30),
  description: Joi.string().max(200),
  members: Joi.array().items(Joi.string()).min(0),
  creatorId: mongoIdSchema,
});

export const joinGroupSchema = Joi.object({ groupId: mongoIdSchema });
