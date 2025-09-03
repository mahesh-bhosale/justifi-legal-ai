import { Router } from 'express';
import lawyersController from '../controllers/lawyers.controller';

const router = Router();

router.get('/search', (req, res) => lawyersController.search(req, res));

export default router;


