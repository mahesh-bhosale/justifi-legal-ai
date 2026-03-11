import { Router } from 'express';
import multer from 'multer';
import PredictionController from '../controllers/prediction.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

router.post(
  '/upload',
  verifyToken,
  requireRole(['citizen', 'lawyer']),
  upload.single('file'),
  (req, res) => PredictionController.upload(req, res),
);

export default router;

