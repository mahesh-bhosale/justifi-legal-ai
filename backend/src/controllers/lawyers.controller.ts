import { Request, Response } from 'express';
import { z } from 'zod';
import lawyersService, { LawyerSearchFilters } from '../services/lawyers.service';

const searchSchema = z.object({
  specialization: z.string().optional().transform((v) => (v ? v.split(',') : undefined)),
  city: z.string().optional(),
  minYears: z.string().optional().transform((v) => (v ? parseInt(v) : undefined)),
  maxRate: z.string().optional().transform((v) => (v ? parseInt(v) : undefined)),
  languages: z.string().optional().transform((v) => (v ? v.split(',') : undefined)),
  availability: z.enum(['available', 'limited', 'unavailable']).optional(),
  minRating: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v) : undefined)),
  offset: z.string().optional().transform((v) => (v ? parseInt(v) : undefined)),
});

class LawyersController {
  async search(req: Request, res: Response): Promise<void> {
    try {
      const q = searchSchema.parse(req.query);
      const filters: LawyerSearchFilters = {
        specializations: q.specialization,
        city: q.city,
        minYears: q.minYears,
        maxRate: q.maxRate,
        languages: q.languages,
        availability: q.availability,
        minRating: q.minRating,
        limit: q.limit,
        offset: q.offset,
      };

      const results = await lawyersService.searchLawyers(filters);
      res.json({ success: true, count: results.length, data: results });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
        return;
      }
      console.error('Error searching lawyers:', error);
      res.status(500).json({ success: false, message: 'Failed to search lawyers' });
    }
  }
}

export default new LawyersController();


