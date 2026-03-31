import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import profileController from '../controllers/profile.controller';

const router = Router();

router.use(verifyToken);

router.get('/profile', (req, res) => profileController.getProfile(req, res));
router.patch('/profile', (req, res) => profileController.updateProfile(req, res));
router.post('/profile/change-password', (req, res) =>
  profileController.changePassword(req, res),
);

export default router;

