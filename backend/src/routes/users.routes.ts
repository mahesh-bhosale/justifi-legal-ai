import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import usersController from '../controllers/users.controller';

const router = Router();

router.use(verifyToken, requireAdmin);

router.get('/', (req, res) => usersController.list(req, res));

export default router;

