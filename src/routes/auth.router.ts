import { Router } from 'express';
import { authMiddleware, validationMiddleware, verifyRefreshTokenMiddleware } from '../middlewares';
import { AuthController } from '../controllers';
import { googleLoginSchema, loginSchema, registerSchema } from '../validations';

export const authRouter: Router = Router();

authRouter.post(
  '/register',
  validationMiddleware({ bodySchema: registerSchema }),
  AuthController.register,
);
authRouter.post('/login', validationMiddleware({ bodySchema: loginSchema }), AuthController.login);
authRouter.post('/logout', verifyRefreshTokenMiddleware, AuthController.logout);
authRouter.post('/refreshToken', verifyRefreshTokenMiddleware, AuthController.refresh);
authRouter.get('/verify', authMiddleware, AuthController.verifyUser);
authRouter.post(
  '/google',
  validationMiddleware({ bodySchema: googleLoginSchema }),
  AuthController.loginWithGoogle,
);
