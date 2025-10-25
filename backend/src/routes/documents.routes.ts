import { Router } from 'express';
import documentsController from '../controllers/documents.controller';
import { verifyToken } from '../middleware/auth.middleware';
import multer from 'multer';

// Configure multer with increased file size limits (50MB)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB in bytes
    fieldSize: 50 * 1024 * 1024, // 50MB for field values
  }
});
const router = Router();

router.use(verifyToken);

router.post('/cases/:caseId/documents', upload.single('file'), (req, res) => documentsController.upload(req, res));
router.get('/cases/:caseId/documents', (req, res) => documentsController.list(req, res));

export default router;


