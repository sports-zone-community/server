import { Router } from 'express';
import { authMiddleware } from '../middlewares';
import { AuthController } from '../controllers';

export const authRouter: Router = Router();

authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);
authRouter.post('/logout', authMiddleware, AuthController.logout);
authRouter.post('/refreshToken', authMiddleware, AuthController.refresh);
authRouter.get('/verify', authMiddleware, AuthController.verifyUser);
authRouter.post('/google', AuthController.loginWithGoogle);
