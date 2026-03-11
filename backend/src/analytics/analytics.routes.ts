import { Router } from 'express';
import AnalyticsController from './analytics.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Admin analytics
router.get(
  '/admin/overview',
  verifyToken,
  requireRole(['admin']),
  (req, res) => AnalyticsController.adminOverview(req, res),
);

router.get(
  '/admin/users-growth',
  verifyToken,
  requireRole(['admin']),
  (req, res) => AnalyticsController.adminUsersGrowth(req, res),
);

router.get(
  '/admin/cases-trend',
  verifyToken,
  requireRole(['admin']),
  (req, res) => AnalyticsController.adminCasesTrend(req, res),
);

router.get(
  '/admin/lawyer-activity',
  verifyToken,
  requireRole(['admin']),
  (req, res) => AnalyticsController.adminLawyerActivity(req, res),
);

// Lawyer analytics
router.get(
  '/lawyer/dashboard',
  verifyToken,
  requireRole(['lawyer']),
  (req, res) => AnalyticsController.lawyerDashboard(req, res),
);

router.get(
  '/lawyer/case-stats',
  verifyToken,
  requireRole(['lawyer']),
  (req, res) => AnalyticsController.lawyerCaseStats(req, res),
);

router.get(
  '/lawyer/proposal-success',
  verifyToken,
  requireRole(['lawyer']),
  (req, res) => AnalyticsController.lawyerProposalSuccess(req, res),
);

router.get(
  '/lawyer/reviews',
  verifyToken,
  requireRole(['lawyer']),
  (req, res) => AnalyticsController.lawyerReviews(req, res),
);

// Citizen analytics
router.get(
  '/citizen/dashboard',
  verifyToken,
  requireRole(['citizen']),
  (req, res) => AnalyticsController.citizenDashboard(req, res),
);

router.get(
  '/citizen/case-history',
  verifyToken,
  requireRole(['citizen']),
  (req, res) => AnalyticsController.citizenCaseHistory(req, res),
);

router.get(
  '/citizen/prediction-usage',
  verifyToken,
  requireRole(['citizen']),
  (req, res) => AnalyticsController.citizenPredictionUsage(req, res),
);

// AI analytics
router.get(
  '/ai/model-performance',
  verifyToken,
  requireRole(['admin']),
  (req, res) => AnalyticsController.aiModelPerformance(req, res),
);

router.get(
  '/ai/summarization-stats',
  verifyToken,
  requireRole(['admin']),
  (req, res) => AnalyticsController.aiSummarizationStats(req, res),
);

export default router;

