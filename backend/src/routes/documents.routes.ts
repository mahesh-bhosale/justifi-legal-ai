import { Router } from 'express';
import documentsController from '../controllers/documents.controller';
import { verifyToken } from '../middleware/auth.middleware';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.use(verifyToken);

router.post('/cases/:caseId/documents', upload.single('file'), (req, res) => documentsController.upload(req, res));
router.get('/cases/:caseId/documents', (req, res) => documentsController.list(req, res));

export default router;


