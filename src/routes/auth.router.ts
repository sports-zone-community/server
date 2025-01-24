import { Router } from 'express';
import {
  login,
  loginWithGoogle,
  logout,
  refreshToken,
  register,
  verifyUser,
} from '../controllers/auth';
import { authMiddleware } from '../common/auth-middleware';

export const authRouter: Router = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/refreshToken', refreshToken);
authRouter.get('/verify', authMiddleware, verifyUser);
authRouter.post('/google', loginWithGoogle);
