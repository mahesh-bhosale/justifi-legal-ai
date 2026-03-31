import { Router } from 'express';
import reviewsController from '../controllers/reviews.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireCitizen } from '../middleware/role.middleware';

const router = Router();

// Public: fetch reviews for a lawyer
router.get('/lawyer/:lawyerId', (req, res) => reviewsController.getLawyerReviews(req, res));
router.get('/lawyer/:lawyerId/stats', (req, res) => reviewsController.getLawyerReviewStats(req, res));

// Protected: citizen can create a review
router.post('/', verifyToken, requireCitizen, (req, res) => reviewsController.create(req, res));

// Protected: check case + lawyer eligibility for the current citizen
router.get('/case/:caseId', verifyToken, requireCitizen, (req, res) => reviewsController.getCaseReview(req, res));

// Protected: citizen can delete their own review (enables re-review after deletion)
router.delete('/:id', verifyToken, requireCitizen, (req, res) => reviewsController.deleteReview(req, res));

export default router;

