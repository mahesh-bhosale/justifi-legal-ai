import { Router } from 'express';
import messagesController from '../controllers/messages.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

router.post('/cases/:caseId/messages', (req, res) => messagesController.create(req, res));
router.get('/cases/:caseId/messages', (req, res) => messagesController.list(req, res));
router.patch('/messages/:id/read', (req, res) => messagesController.markRead(req, res));

export default router;


