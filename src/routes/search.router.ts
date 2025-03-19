import { Router } from 'express';
import { search } from '../controllers/search.controller';
import { validationMiddleware } from '../middlewares';
import { searchQuerySchema } from '../validations';

export const searchRouter: Router = Router();

searchRouter.get('/:searchQuery', validationMiddleware({ paramsSchema: searchQuerySchema }), search);
