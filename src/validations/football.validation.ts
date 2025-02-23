import Joi from 'joi';

export const footballQuerySchema = Joi.object({
  league: Joi.number().positive(),
  season: Joi.number().positive(),
  teamId: Joi.number().positive(),
}); 