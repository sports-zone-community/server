import { Router } from 'express';
import { login, logout, refreshToken, register } from '../controllers/auth';

const router: Router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refreshToken', refreshToken);

export default router;
