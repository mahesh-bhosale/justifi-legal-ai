import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import authController from '../controllers/auth.controller';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many refresh attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/signup', authLimiter, (req, res) => void authController.signup(req, res));
router.post('/login', authLimiter, (req, res) => void authController.login(req, res));
router.post('/refresh', refreshLimiter, (req, res) => void authController.refresh(req, res));
router.post('/logout', refreshLimiter, (req, res) => void authController.logout(req, res));

export default router;
