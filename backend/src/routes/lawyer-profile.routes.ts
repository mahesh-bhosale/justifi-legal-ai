import { Router } from 'express';
import lawyerProfileController from '../controllers/lawyer-profile.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireLawyer, requireAdmin } from '../middleware/role.middleware';

const router = Router();

// Public routes (no authentication required)
router.get('/specializations', lawyerProfileController.getSpecializations);
router.get('/service-areas', lawyerProfileController.getServiceAreas);
router.get('/languages', lawyerProfileController.getLanguages);
router.get('/', lawyerProfileController.getProfiles);
router.get('/:id', lawyerProfileController.getProfile);

// Protected routes (authentication required)
router.use(verifyToken);

// Lawyer-only routes
router.post('/', requireLawyer, lawyerProfileController.createProfile);
router.get('/me/profile', requireLawyer, lawyerProfileController.getMyProfile);
router.patch('/:id', requireLawyer, lawyerProfileController.updateProfile);

// Admin-only routes
router.patch('/:id/verify', requireAdmin, lawyerProfileController.verifyProfile);

export default router;
