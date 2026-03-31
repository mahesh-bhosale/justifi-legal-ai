import { Request, Response } from 'express';
import { z } from 'zod';
import documentsService from '../services/documents.service';
import { uploadDocument as uploadToSupabase, generateSignedUrl } from '../services/storage.service';
import { sanitizeUploadedFileName } from '../config/upload-security';

const uploadSchema = z.object({
  description: z.string().optional(),
});

class DocumentsController {
  async upload(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Auth required' }); return; }
      const caseId = parseInt(req.params.caseId);
      if (isNaN(caseId)) { res.status(400).json({ success: false, message: 'Invalid caseId' }); return; }
      if (!req.file) { res.status(400).json({ success: false, message: 'File is required' }); return; }
      const body = uploadSchema.parse(req.body);
      const safeFileName = sanitizeUploadedFileName(req.file.originalname);

      const uploaded = await uploadToSupabase({
        caseId,
        fileBuffer: req.file.buffer,
        fileName: safeFileName,
        mimeType: req.file.mimetype,
      });

      const doc = await documentsService.uploadDocument({
        caseId,
        uploadedBy: req.user.userId,
        fileUrl: uploaded.path,
        fileName: safeFileName,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        description: body.description,
      });
      if (!doc) { res.status(403).json({ success: false, message: 'Not allowed' }); return; }
      res.status(201).json({ success: true, data: doc });
    } catch (err: any) {
      if (err instanceof z.ZodError) { res.status(400).json({ success: false, message: 'Validation error', errors: err.errors }); return; }
      console.error('Upload document error:', err);
      res.status(500).json({ success: false, message: 'Failed to upload document' });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Auth required' }); return; }
      const caseId = parseInt(req.params.caseId);
      if (isNaN(caseId)) { res.status(400).json({ success: false, message: 'Invalid caseId' }); return; }
      const rows = await documentsService.listDocuments(caseId, req.user.userId);
      if (!rows) { res.status(403).json({ success: false, message: 'Not allowed' }); return; }
      res.json({ success: true, count: rows.length, data: rows });
    } catch (err: any) {
      console.error('List documents error:', err);
      res.status(500).json({ success: false, message: 'Failed to list documents' });
    }
  }

  async getSignedUrl(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Auth required' }); return; }
      const caseId = parseInt(req.params.caseId);
      const documentId = parseInt(req.params.documentId);
      if (isNaN(caseId) || isNaN(documentId)) {
        res.status(400).json({ success: false, message: 'Invalid caseId or documentId' });
        return;
      }

      const doc = await documentsService.getDocumentById(caseId, documentId, req.user.userId);
      if (!doc) {
        res.status(404).json({ success: false, message: 'Document not found' });
        return;
      }

      const dispositionRaw = String(req.query.disposition || 'inline').toLowerCase();
      const disposition = dispositionRaw === 'attachment' ? 'attachment' : 'inline';

      const expiresInSeconds = 300;
      const url = await generateSignedUrl({
        path: doc.fileUrl,
        expiresInSeconds,
        downloadFileName: disposition === 'attachment' ? doc.fileName : undefined,
      });
      res.json({
        success: true,
        url,
        expiresIn: expiresInSeconds,
        disposition,
        fileName: doc.fileName,
        mimeType: doc.mimeType,
      });
    } catch (err: any) {
      console.error('Generate signed URL error:', err);
      res.status(500).json({ success: false, message: 'Failed to generate signed URL' });
    }
  }
}

export default new DocumentsController();


