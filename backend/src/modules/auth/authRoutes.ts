import { Router } from 'express';
import { login, register, getMe } from './authController.js';
import { requireAuth } from '../../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.get('/me', requireAuth, getMe);
