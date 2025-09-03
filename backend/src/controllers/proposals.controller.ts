import { Request, Response } from 'express';
import { z } from 'zod';
import proposalsService from '../services/proposals.service';

const createSchema = z.object({
  proposalText: z.string().min(10),
  proposedFee: z.number().positive().optional(),
  estimatedDuration: z.string().optional(),
});

const statusSchema = z.object({ status: z.enum(['accepted', 'rejected']) });

class ProposalsController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'lawyer') {
        res.status(403).json({ success: false, message: 'Lawyer required' });
        return;
      }
      const caseId = parseInt(req.params.caseId);
      if (isNaN(caseId)) {
        res.status(400).json({ success: false, message: 'Invalid caseId' });
        return;
      }
      const body = createSchema.parse(req.body);
      const created = await proposalsService.createProposal({ caseId, lawyerId: req.user.userId, ...body });
      res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: err.errors });
        return;
      }
      const message = err?.message === 'Duplicate proposal' ? err.message : 'Failed to create proposal';
      const code = err?.message === 'Duplicate proposal' ? 409 : 500;
      console.error('Create proposal error:', err);
      res.status(code).json({ success: false, message });
    }
  }

  async listForCase(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const caseId = parseInt(req.params.caseId);
      if (isNaN(caseId)) {
        res.status(400).json({ success: false, message: 'Invalid caseId' });
        return;
      }
      const rows = await proposalsService.listForCase(caseId, { role: req.user.role as 'citizen' | 'lawyer' | 'admin', userId: req.user.userId });
      res.json({ success: true, count: rows.length, data: rows });
    } catch (err: any) {
      const code = err?.message === 'Access denied' ? 403 : err?.message === 'Case not found' ? 404 : 500;
      res.status(code).json({ success: false, message: err?.message || 'Failed to list proposals' });
    }
  }

  async setStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'citizen') {
        res.status(403).json({ success: false, message: 'Citizen required' });
        return;
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return;
      }
      const { status } = statusSchema.parse(req.body);
      const result = await proposalsService.setStatus(id, status, { role: 'citizen', userId: req.user.userId });
      if (!result) {
        res.status(404).json({ success: false, message: 'Proposal not found' });
        return;
      }
      res.json({ success: true, data: result });
    } catch (err: any) {
      const code = err?.message === 'Access denied' ? 403 : 500;
      res.status(code).json({ success: false, message: err?.message || 'Failed to update status' });
    }
  }

  async withdraw(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'lawyer') {
        res.status(403).json({ success: false, message: 'Lawyer required' });
        return;
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return;
      }
      const updated = await proposalsService.withdraw(id, { role: 'lawyer', userId: req.user.userId });
      if (!updated) {
        res.status(404).json({ success: false, message: 'Not found or not allowed' });
        return;
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      console.error('Withdraw proposal error:', err);
      res.status(500).json({ success: false, message: 'Failed to withdraw proposal' });
    }
  }
}

export default new ProposalsController();


