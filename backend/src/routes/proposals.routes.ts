import { Router } from 'express';
import proposalsController from '../controllers/proposals.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

// Lawyer creates a proposal for a case
router.post('/cases/:caseId/proposals', (req, res) => proposalsController.create(req, res));

// Citizen owner, assigned lawyer, or admin lists proposals for a case
router.get('/cases/:caseId/proposals', (req, res) => proposalsController.listForCase(req, res));

// Citizen owner accepts/rejects proposal
router.patch('/proposals/:id/status', (req, res) => proposalsController.setStatus(req, res));

// Lawyer withdraws own proposal
router.patch('/proposals/:id/withdraw', (req, res) => proposalsController.withdraw(req, res));

export default router;


