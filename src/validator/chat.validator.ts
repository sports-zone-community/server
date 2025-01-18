import Joi from 'joi';

export const chatValidators = {

  markMessagesAsReadSchema: Joi.object({
    chatId: Joi.string().required().hex().length(24),
    userId: Joi.string().required().hex().length(24)
  }),

  getChatMessagesSchema: Joi.object({
    chatId: Joi.string().required().hex().length(24)
  }),

  createPrivateChatSchema: Joi.object({
    participantId: Joi.string().required().hex().length(24),
    userId: Joi.string().required().hex().length(24)
  })
}; 