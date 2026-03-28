import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AIController } from '../controllers/ai.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import multer from 'multer';
import {
  MAX_AI_UPLOAD_BYTES,
  pdfOnlyFileFilter,
} from '../config/upload-security';

const router = Router();

const publicAiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Too many requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const uid = (req as { user?: { userId?: string } }).user?.userId;
    return uid ? String(uid) : req.ip || 'anon';
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_AI_UPLOAD_BYTES,
    fieldSize: MAX_AI_UPLOAD_BYTES,
  },
  fileFilter: pdfOnlyFileFilter,
});

router.post('/public/summarize', publicAiLimiter, AIController.summarizeText);

router.post('/summarize/text', verifyToken, aiLimiter, AIController.summarizeText);
router.post('/summarize/pdf', verifyToken, aiLimiter, upload.single('file'), AIController.summarizePdf);
router.post('/ask/text', verifyToken, aiLimiter, AIController.askQuestion);
router.post('/ask/pdf', verifyToken, aiLimiter, upload.single('file'), AIController.askPdfQuestion);

router.post('/citizen/summarize', verifyToken, requireRole(['citizen']), aiLimiter, AIController.summarizeText);
router.post('/lawyer/summarize', verifyToken, requireRole(['lawyer']), aiLimiter, AIController.summarizeText);

router.post('/chat/simple', verifyToken, aiLimiter, AIController.simpleChat);

export default router;
