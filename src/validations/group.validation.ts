import Joi from "joi";

export const createGroupSchema = Joi.object({
    name: Joi.string().required().min(2).max(30),
    description: Joi.string().max(200),
    members: Joi.array().items(Joi.string()).min(0),
    creatorId: Joi.string().required().hex().length(24)
  });
  
export const joinGroupSchema = Joi.object({
    groupId: Joi.string().required().hex().length(24),
  });