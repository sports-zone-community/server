import Joi from 'joi';
import { mongoIdSchema } from './common.validation';

export const getChatMessagesSchema = Joi.object({ chatId: mongoIdSchema });
