import { Router } from 'express';
import documentsController from '../controllers/documents.controller';
import { verifyToken } from '../middleware/auth.middleware';
import multer from 'multer';
import {
  MAX_CASE_DOCUMENT_BYTES,
  caseDocumentFileFilter,
} from '../config/upload-security';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_CASE_DOCUMENT_BYTES,
    fieldSize: MAX_CASE_DOCUMENT_BYTES,
  },
  fileFilter: caseDocumentFileFilter,
});

const router = Router();

router.use(verifyToken);

router.post('/cases/:caseId/documents', upload.single('file'), (req, res) =>
  documentsController.upload(req, res)
);
router.get('/cases/:caseId/documents', (req, res) => documentsController.list(req, res));
router.get('/cases/:caseId/documents/:documentId/url', (req, res) =>
  documentsController.getSignedUrl(req, res)
);

export default router;
