import { Router } from 'express';
import { authMiddleware, verifyRefreshTokenMiddleware } from '../middlewares';
import { AuthController } from '../controllers';

export const authRouter: Router = Router();

authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);
authRouter.post('/logout', verifyRefreshTokenMiddleware, AuthController.logout);
authRouter.post('/refreshToken', verifyRefreshTokenMiddleware, AuthController.refresh);
authRouter.get('/verify', authMiddleware, AuthController.verifyUser);
authRouter.post('/google', AuthController.loginWithGoogle);
