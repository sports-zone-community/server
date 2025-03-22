import { Router } from 'express';
import { AdminController } from '../controllers';

export const adminRouter: Router = Router();

adminRouter.delete('/delete-all', AdminController.deleteAllCollections);