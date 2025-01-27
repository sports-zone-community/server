import Joi from 'joi';

export const mongoIdSchema: Joi.StringSchema = Joi.string().required().hex().length(24);
