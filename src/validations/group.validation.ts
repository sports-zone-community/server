import Joi from 'joi';
import { mongoIdSchema } from './common.validation';
import { Group } from '../models';

export type CreateGroupObject = Pick<Group, 'name' | 'description' | 'avatar'>;

export const createGroupSchema: Joi.ObjectSchema<CreateGroupObject> = Joi.object<CreateGroupObject>(
  {
    name: Joi.string().required().min(2).max(30),
    description: Joi.string().max(200),
  },
);

export interface GroupIdParams {
  groupId: string;
}

export const groupIdSchema: Joi.ObjectSchema<GroupIdParams> = Joi.object<GroupIdParams>({
  groupId: mongoIdSchema,
});
