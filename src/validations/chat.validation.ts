import Joi from 'joi';

export const getChatMessagesSchema = Joi.object({
    chatId: Joi.string().required().hex().length(24)
  });