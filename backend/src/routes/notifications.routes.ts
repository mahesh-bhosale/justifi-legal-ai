import { Router } from 'express';
import notificationsController from '../controllers/notifications.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/notifications', (req, res) => notificationsController.list(req, res));
router.patch('/notifications/:id/read', (req, res) => notificationsController.markRead(req, res));

export default router;

