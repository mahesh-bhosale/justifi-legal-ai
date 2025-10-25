import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import multer from 'multer';

const router = Router();
// Configure multer with increased file size limits (50MB)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB in bytes
    fieldSize: 50 * 1024 * 1024, // 50MB for field values
  }
});

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