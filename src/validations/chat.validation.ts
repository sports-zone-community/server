import Joi from 'joi';
import { mongoIdSchema } from './common.validation';

export interface ChatIdParams {
    chatId: string;
  }
  
export const chatIdSchema: Joi.ObjectSchema<ChatIdParams> = Joi.object<ChatIdParams>({
  chatId: mongoIdSchema,
});
