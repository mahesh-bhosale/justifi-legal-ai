import { Request, Response } from 'express';
import { z } from 'zod';
import reviewsService, {
  ReviewsServiceError,
  type LawyerReviewStats,
  type ReviewsServiceReview,
  type ReviewServiceErrorCode,
} from '../services/reviews.service';
import { sanitizePlainText } from '../utils/sanitize-text';

const createSchema = z.object({
  caseId: z.number().int().positive(),
  lawyerId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

const lawyerIdParamSchema = z.object({
  lawyerId: z.string().uuid(),
});

const caseIdParamSchema = z.object({
  caseId: z.string().transform((v) => parseInt(v, 10)).refine((n) => !Number.isNaN(n) && n > 0, 'Invalid caseId'),
});

const reviewIdParamSchema = z.object({
  id: z.string().transform((v) => parseInt(v, 10)).refine((n) => !Number.isNaN(n) && n > 0, 'Invalid id'),
});

function reviewHttpStatus(code: ReviewServiceErrorCode): number {
  switch (code) {
    case 'case_not_found':
      return 404;
    case 'forbidden':
      return 403;
    case 'case_not_completed':
      return 400;
    case 'case_missing_lawyer':
      return 400;
    case 'case_already_reviewed':
      return 400;
    case 'user_already_reviewed_lawyer':
      return 400;
    default:
      return 400;
  }
}

class ReviewsController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'citizen') {
        res.status(403).json({ success: false, message: 'Citizen access required' });
        return;
      }

      const body = createSchema.parse(req.body);
      const comment = body.comment !== undefined ? sanitizePlainText(body.comment) : undefined;

      const created = await reviewsService.createReview({
        caseId: body.caseId,
        lawyerId: body.lawyerId,
        citizenId: req.user.userId,
        rating: body.rating,
        comment,
      });

      res.status(201).json({ success: true, data: created as ReviewsServiceReview });
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: err.errors });
        return;
      }
      if (err instanceof ReviewsServiceError) {
        res.status(reviewHttpStatus(err.code)).json({ success: false, message: err.message, code: err.code });
        return;
      }
      console.error('Create review error:', err);
      res.status(500).json({ success: false, message: 'Failed to create review' });
    }
  }

  async getLawyerReviews(req: Request, res: Response): Promise<void> {
    try {
      const { lawyerId } = lawyerIdParamSchema.parse(req.params);
      const reviews = await reviewsService.getLawyerReviews(lawyerId);
      res.json({ success: true, count: reviews.length, data: reviews });
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: err.errors });
        return;
      }
      console.error('Get lawyer reviews error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
  }

  async getLawyerReviewStats(req: Request, res: Response): Promise<void> {
    try {
      const { lawyerId } = lawyerIdParamSchema.parse(req.params);
      const stats: LawyerReviewStats = await reviewsService.getLawyerReviewStats(lawyerId);
      res.json({ success: true, data: stats });
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: err.errors });
        return;
      }
      console.error('Get lawyer review stats error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
  }

  async getCaseReview(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'citizen') {
        res.status(403).json({ success: false, message: 'Citizen access required' });
        return;
      }

      const { caseId } = caseIdParamSchema.parse(req.params);
      const data = await reviewsService.getCaseReview(caseId, req.user.userId);
      res.json({ success: true, data });
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: err.errors });
        return;
      }
      if (err instanceof ReviewsServiceError) {
        res.status(reviewHttpStatus(err.code)).json({ success: false, message: err.message, code: err.code });
        return;
      }
      console.error('Get case review eligibility error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch review eligibility' });
    }
  }

  async deleteReview(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'citizen') {
        res.status(403).json({ success: false, message: 'Citizen access required' });
        return;
      }

      const { id } = reviewIdParamSchema.parse(req.params);
      const deleted = await reviewsService.deleteReview(id, req.user.userId);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Review not found' });
        return;
      }

      res.json({ success: true, message: 'Review deleted' });
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: err.errors });
        return;
      }
      if (err instanceof ReviewsServiceError) {
        res.status(reviewHttpStatus(err.code)).json({ success: false, message: err.message, code: err.code });
        return;
      }
      console.error('Delete review error:', err);
      res.status(500).json({ success: false, message: 'Failed to delete review' });
    }
  }
}

export default new ReviewsController();

