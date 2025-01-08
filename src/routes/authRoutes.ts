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

const router: Router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refreshToken', refreshToken);
router.get('/verify', authMiddleware, verifyUser);
router.post('/google', loginWithGoogle);

export default router;
