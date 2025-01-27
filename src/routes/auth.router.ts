import { Router } from 'express';
import { authMiddleware, validationMiddleware } from '../middlewares';
import { AuthController } from '../controllers';
import { loginSchema, registerSchema } from '../validations/auth.validation';

export const authRouter: Router = Router();

authRouter.post(
  '/register',
  validationMiddleware({ bodySchema: registerSchema }),
  AuthController.register,
);
authRouter.post('/login', validationMiddleware({ bodySchema: loginSchema }), AuthController.login);
authRouter.post('/logout', authMiddleware, AuthController.logout);
authRouter.post('/refreshToken', authMiddleware, AuthController.refresh);
authRouter.get('/verify', authMiddleware, AuthController.verifyUser);
authRouter.post('/google', AuthController.loginWithGoogle);
