import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public demo route - no authentication required
router.post('/public/summarize', AIController.summarizeText);

// Authenticated routes
router.post('/summarize/text', verifyToken, AIController.summarizeText);
router.post('/summarize/pdf', verifyToken, upload.single('file'), AIController.summarizePdf);
router.post('/ask/text', verifyToken, AIController.askQuestion);
router.post('/ask/pdf', verifyToken, upload.single('file'), AIController.askPdfQuestion);

// Role-specific routes
router.post('/citizen/summarize', verifyToken, requireRole(['citizen']), AIController.summarizeText);
router.post('/lawyer/summarize', verifyToken, requireRole(['lawyer']), AIController.summarizeText);

export default router;