import Joi from 'joi';
import { mongoIdSchema } from './common.validation';

export interface ChatIdParams {
    chatId: string;
  }

export const chatIdSchema: Joi.ObjectSchema<ChatIdParams> = Joi.object<ChatIdParams>({
  chatId: mongoIdSchema,
});

export type GetSuggestionObject = { prompt: string };
export const getSuggestionSchema: Joi.ObjectSchema<GetSuggestionObject> =
  Joi.object<GetSuggestionObject>({
    prompt: Joi.string().min(1).required(),
  });
