import { Router } from 'express';
import { validationMiddleware } from '../middlewares';
import * as FootballController from '../controllers/football.controller';
import { footballQuerySchema } from '../validations/football.validation';

export const footballRouter: Router = Router();

footballRouter.get(
  '/teams',
  validationMiddleware({ querySchema: footballQuerySchema }),
  FootballController.getTeamsFromServer
);
