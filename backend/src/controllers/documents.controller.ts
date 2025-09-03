import { Request, Response } from 'express';
import { z } from 'zod';
import documentsService from '../services/documents.service';

// Placeholder storage interface. Integrate your actual storage utils here.
async function uploadToStorage(file: Express.Multer.File): Promise<{ url: string }>{
  // Replace with S3/Supabase upload and return public URL
  // For now, simulate local path or buffer-based upload
  return { url: `/uploads/${Date.now()}_${file.originalname}` };
}

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

      const uploaded = await uploadToStorage(req.file);

      const doc = await documentsService.uploadDocument({
        caseId,
        uploadedBy: req.user.userId,
        fileUrl: uploaded.url,
        fileName: req.file.originalname,
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
}

export default new DocumentsController();


