import Joi from 'joi';

export interface SearchQueryParams {
  searchQuery: string;
}

export const searchQuerySchema: Joi.ObjectSchema<SearchQueryParams> = Joi.object({
  searchQuery: Joi.string().required().min(1).max(100),
});
