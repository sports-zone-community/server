import Joi from 'joi';

export const footballQuerySchema = Joi.object({
  league: Joi.number().positive().required(),
  season: Joi.number().positive().required(),
}); 