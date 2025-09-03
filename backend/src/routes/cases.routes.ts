import { Router } from 'express';
import casesController from '../controllers/cases.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.use(verifyToken);

// citizen create
router.post('/', (req, res) => casesController.create(req, res));

// list based on role
router.get('/', (req, res) => casesController.list(req, res));

// get by id (access controlled in service)
router.get('/:id', (req, res) => casesController.getById(req, res));

// update
router.patch('/:id', (req, res) => casesController.update(req, res));

// assign (lawyer/admin)
router.patch('/:id/assign', (req, res) => {
  if (!req.user || (req.user.role !== 'lawyer' && req.user.role !== 'admin')) {
    res.status(403).json({ success: false, message: 'Lawyer or admin required' });
    return;
  }
  return casesController.assign(req, res);
});

// stats (admin)
router.get('/stats/admin', requireAdmin, (req, res) => casesController.stats(req, res));

export default router;


