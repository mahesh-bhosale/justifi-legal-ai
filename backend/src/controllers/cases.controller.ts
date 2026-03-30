import { Request, Response } from 'express';
import { z } from 'zod';
import casesService, { type CaseLifecycleErrorCode } from '../services/cases.service';
import { sanitizePlainText } from '../utils/sanitize-text';

function lifecycleHttpStatus(code: CaseLifecycleErrorCode): number {
  if (code === 'not_found') return 404;
  if (code === 'forbidden') return 403;
  return 400;
}

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  preferredLanguage: z.string().optional(),
  location: z.string().optional(),
  budget: z.number().positive().optional(),
  preferredLawyerId: z.string().uuid().optional(),
});

const listSchema = z.object({
  open: z.string().optional().transform((v) => v === 'true' ? true : v === 'false' ? false : undefined),
  limit: z.string().optional().transform((v) => (v ? parseInt(v) : undefined)),
  offset: z.string().optional().transform((v) => (v ? parseInt(v) : undefined)),
  status: z
    .enum([
      'pending',
      'pending_lawyer_acceptance',
      'in_progress',
      'resolved',
      'closed',
      'rejected',
    ])
    .optional(),
  category: z.string().optional(),
  citizenId: z.string().optional(),
  lawyerId: z.string().optional(),
  search: z.string().optional(),
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

const resolveSchema = z.object({
  resolution: z.string().min(1),
});

const withdrawSchema = z.object({
  reason: z.string().min(1),
  note: z.string().optional(),
});

class CasesController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'citizen') {
        res.status(403).json({ success: false, message: 'Citizen access required' });
        return;
      }
      const body = createSchema.parse(req.body);
      try {
        const created = await casesService.createCase({ citizenId: req.user.userId, ...body });
        res.status(201).json({ success: true, data: created });
      } catch (err: any) {
        if (err.message && err.message.includes('already have a pending contact request')) {
          res.status(400).json({ success: false, message: err.message });
          return;
        }
        throw err;
      }
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
      const sanitized = { ...body };
      if (sanitized.title !== undefined) sanitized.title = sanitizePlainText(sanitized.title);
      if (sanitized.description !== undefined) sanitized.description = sanitizePlainText(sanitized.description);
      if (sanitized.category !== undefined) sanitized.category = sanitizePlainText(sanitized.category);
      if (sanitized.preferredLanguage !== undefined) {
        sanitized.preferredLanguage = sanitizePlainText(sanitized.preferredLanguage);
      }
      if (sanitized.location !== undefined) sanitized.location = sanitizePlainText(sanitized.location);
      if (sanitized.resolution !== undefined) sanitized.resolution = sanitizePlainText(sanitized.resolution);

      const updated = await casesService.updateCase(
        id,
        { role: req.user.role as 'citizen' | 'lawyer' | 'admin', userId: req.user.userId },
        sanitized
      );
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

  async getDirectContactRequests(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'lawyer') {
        res.status(403).json({ success: false, message: 'Lawyer access required' });
        return;
      }
      const requests = await casesService.getDirectContactRequests(req.user.userId);
      res.json({ success: true, count: requests.length, data: requests });
    } catch (err: any) {
      console.error('Get direct contact requests error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch direct contact requests' });
    }
  }

  async acceptDirectContact(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'lawyer') {
        res.status(403).json({ success: false, message: 'Lawyer access required' });
        return;
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid case id' });
        return;
      }
      const updated = await casesService.acceptDirectContact(id, req.user.userId);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Case not found or not a direct contact request' });
        return;
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      console.error('Accept direct contact error:', err);
      res.status(500).json({ success: false, message: 'Failed to accept direct contact request' });
    }
  }

  async rejectDirectContact(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'lawyer') {
        res.status(403).json({ success: false, message: 'Lawyer access required' });
        return;
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid case id' });
        return;
      }
      const updated = await casesService.rejectDirectContact(id, req.user.userId);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Case not found or not a direct contact request' });
        return;
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      console.error('Reject direct contact error:', err);
      res.status(500).json({ success: false, message: 'Failed to reject direct contact request' });
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

  async resolve(req: Request, res: Response): Promise<void> {
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
      const body = resolveSchema.parse(req.body);
      const resolution = sanitizePlainText(body.resolution);
      const result = await casesService.resolveCase(id, { role: req.user.role as 'lawyer' | 'admin', userId: req.user.userId }, resolution);
      if (!result.ok) {
        const msg =
          result.error === 'invalid_status'
            ? 'Case must be in progress to resolve'
            : result.error === 'missing_resolution'
              ? 'Resolution is required'
              : result.error === 'invalid_transition'
                ? 'Invalid status transition'
                : result.error === 'forbidden'
                  ? 'Not allowed'
                  : 'Not found';
        res.status(lifecycleHttpStatus(result.error)).json({ success: false, message: msg, code: result.error });
        return;
      }
      res.json({ success: true, data: result.data });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: err.errors });
        return;
      }
      console.error('Resolve case error:', err);
      res.status(500).json({ success: false, message: 'Failed to resolve case' });
    }
  }

  async terminate(req: Request, res: Response): Promise<void> {
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
      const result = await casesService.terminateCase(id, { role: req.user.role as 'lawyer' | 'admin', userId: req.user.userId });
      if (!result.ok) {
        const msg =
          result.error === 'invalid_status'
            ? 'Case must be in progress to terminate'
            : result.error === 'invalid_transition'
              ? 'Invalid status transition'
              : result.error === 'forbidden'
                ? 'Not allowed'
                : 'Not found';
        res.status(lifecycleHttpStatus(result.error)).json({ success: false, message: msg, code: result.error });
        return;
      }
      res.json({ success: true, data: result.data });
    } catch (err: any) {
      console.error('Terminate case error:', err);
      res.status(500).json({ success: false, message: 'Failed to terminate case' });
    }
  }

  async withdraw(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'citizen') {
        res.status(403).json({ success: false, message: 'Citizen access required' });
        return;
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return;
      }
      const body = withdrawSchema.parse(req.body);
      const reason = sanitizePlainText(body.reason);
      const note = body.note !== undefined ? sanitizePlainText(body.note) : undefined;
      const result = await casesService.withdrawCase(id, req.user.userId, reason, note);
      if (!result.ok) {
        const msgMap: Record<string, string> = {
          not_withdrawable: 'This case cannot be withdrawn in its current status',
          lawyer_assigned: 'A lawyer is already assigned; you cannot withdraw this case',
          proposal_accepted: 'A proposal has already been accepted; you cannot withdraw this case',
          invalid_transition: 'Invalid status transition',
          forbidden: 'Not allowed',
        };
        res.status(lifecycleHttpStatus(result.error)).json({
          success: false,
          message: msgMap[result.error] || 'Unable to withdraw case',
          code: result.error,
        });
        return;
      }
      res.json({ success: true, data: result.data });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: err.errors });
        return;
      }
      console.error('Withdraw case error:', err);
      res.status(500).json({ success: false, message: 'Failed to withdraw case' });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Admin required' });
        return;
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return;
      }
      const deleted = await casesService.deleteCase(id, req.user.userId);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Case not found' });
        return;
      }
      res.json({ success: true, message: 'Case deleted' });
    } catch (err: any) {
      console.error('Delete case error:', err);
      res.status(500).json({ success: false, message: 'Failed to delete case' });
    }
  }

  async listUpdates(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Admin required' });
        return;
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return;
      }
      const rows = await casesService.listCaseAuditLog(id, { role: 'admin', userId: req.user.userId });
      if (rows === null) {
        res.status(404).json({ success: false, message: 'Case not found' });
        return;
      }
      res.json({ success: true, count: rows.length, data: rows });
    } catch (err: any) {
      console.error('List case updates error:', err);
      res.status(500).json({ success: false, message: 'Failed to load case updates' });
    }
  }
}

export default new CasesController();


