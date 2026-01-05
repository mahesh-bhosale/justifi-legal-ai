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

// stats (admin) - must come before /:id
router.get('/stats/admin', requireAdmin, (req, res) => casesController.stats(req, res));

// direct contact requests (lawyer only) - must come before /:id
router.get('/direct-requests', (req, res) => {
  if (!req.user || req.user.role !== 'lawyer') {
    res.status(403).json({ success: false, message: 'Lawyer access required' });
    return;
  }
  return casesController.getDirectContactRequests(req, res);
});

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

// accept direct contact (lawyer only)
router.patch('/:id/accept', (req, res) => {
  if (!req.user || req.user.role !== 'lawyer') {
    res.status(403).json({ success: false, message: 'Lawyer access required' });
    return;
  }
  return casesController.acceptDirectContact(req, res);
});

// reject direct contact (lawyer only)
router.patch('/:id/reject', (req, res) => {
  if (!req.user || req.user.role !== 'lawyer') {
    res.status(403).json({ success: false, message: 'Lawyer access required' });
    return;
  }
  return casesController.rejectDirectContact(req, res);
});

export default router;


