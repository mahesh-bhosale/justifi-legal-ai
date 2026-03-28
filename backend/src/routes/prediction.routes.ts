import { Router } from 'express';
import multer from 'multer';
import PredictionController from '../controllers/prediction.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { MAX_AI_UPLOAD_BYTES, pdfOnlyFileFilter } from '../config/upload-security';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_AI_UPLOAD_BYTES,
  },
  fileFilter: pdfOnlyFileFilter,
});

router.post(
  '/upload',
  verifyToken,
  requireRole(['citizen', 'lawyer']),
  upload.single('file'),
  (req, res) => PredictionController.upload(req, res),
);

export default router;

