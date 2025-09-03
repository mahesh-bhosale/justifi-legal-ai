import { Request, Response } from 'express';
import { z } from 'zod';
import casesService from '../services/cases.service';

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  preferredLanguage: z.string().optional(),
  location: z.string().optional(),
  budget: z.number().positive().optional(),
});

const listSchema = z.object({
  open: z.string().optional().transform((v) => v === 'true' ? true : v === 'false' ? false : undefined),
  limit: z.string().optional().transform((v) => (v ? parseInt(v) : undefined)),
  offset: z.string().optional().transform((v) => (v ? parseInt(v) : undefined)),
  status: z.enum(['pending', 'in_progress', 'resolved', 'closed']).optional(),
  category: z.string().optional(),
  citizenId: z.string().optional(),
  lawyerId: z.string().optional(),
});

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  category: z.string().min(2).optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  preferredLanguage: z.string().optional(),
  location: z.string().optional(),
  budget: z.number().positive().optional(),
  status: z.enum(['pending', 'in_progress', 'resolved', 'closed']).optional(),
  nextHearingDate: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  resolution: z.string().optional(),
});

const assignSchema = z.object({
  lawyerId: z.string(),
});

class CasesController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'citizen') {
        res.status(403).json({ success: false, message: 'Citizen access required' });
        return;
      }
      const body = createSchema.parse(req.body);
      const created = await casesService.createCase({ citizenId: req.user.userId, ...body });
      res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: err.errors });
        return;
      }
      console.error('Create case error:', err);
      res.status(500).json({ success: false, message: 'Failed to create case' });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const q = listSchema.parse(req.query);
      const results = await casesService.listCases({
        role: req.user.role as 'citizen' | 'lawyer' | 'admin',
        userId: req.user.userId,
        open: q.open,
        limit: q.limit,
        offset: q.offset,
        status: q.status,
        category: q.category,
        citizenId: q.citizenId,
        lawyerId: q.lawyerId,
      });
      res.json({ success: true, count: results.length, data: results });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: err.errors });
        return;
      }
      console.error('List cases error:', err);
      res.status(500).json({ success: false, message: 'Failed to list cases' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return;
      }
      const found = await casesService.getById(id, { role: req.user.role as 'citizen' | 'lawyer' | 'admin', userId: req.user.userId });
      if (!found) {
        res.status(404).json({ success: false, message: 'Not found or access denied' });
        return;
      }
      res.json({ success: true, data: found });
    } catch (err: any) {
      console.error('Get case error:', err);
      res.status(500).json({ success: false, message: 'Failed to get case' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return;
      }
      const body = updateSchema.parse(req.body);
      const updated = await casesService.updateCase(id, { role: req.user.role as 'citizen' | 'lawyer' | 'admin', userId: req.user.userId }, body);
      if (!updated) {
        res.status(403).json({ success: false, message: 'Not allowed or not found' });
        return;
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: err.errors });
        return;
      }
      console.error('Update case error:', err);
      res.status(500).json({ success: false, message: 'Failed to update case' });
    }
  }

  async assign(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== 'lawyer' && req.user.role !== 'admin')) {
        res.status(403).json({ success: false, message: 'Lawyer or admin required' });
        return;
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return;
      }
      const { lawyerId } = assignSchema.parse(req.body);
      const assigned = await casesService.assignCase(id, lawyerId, { role: req.user.role as 'lawyer' | 'admin', userId: req.user.userId });
      if (!assigned) {
        res.status(403).json({ success: false, message: 'Not allowed or not found' });
        return;
      }
      res.json({ success: true, data: assigned });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: err.errors });
        return;
      }
      console.error('Assign case error:', err);
      res.status(500).json({ success: false, message: 'Failed to assign case' });
    }
  }

  async stats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Admin required' });
        return;
      }
      const s = await casesService.stats();
      res.json({ success: true, data: s });
    } catch (err: any) {
      console.error('Stats error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
  }
}

export default new CasesController();


