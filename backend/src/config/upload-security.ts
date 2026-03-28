import type { Request } from 'express';
import type { FileFilterCallback } from 'multer';

/** Allowed MIME types for case documents (Supabase uploads). */
export const ALLOWED_CASE_DOCUMENT_MIMES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] as const;

export const ALLOWED_AI_PDF_MIMES = ['application/pdf'] as const;

export const MAX_CASE_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const MAX_AI_UPLOAD_BYTES = 10 * 1024 * 1024;

export function sanitizeUploadedFileName(originalName: string, maxLen = 200): string {
  const trimmed = originalName.trim();
  const safe = trimmed.replace(/[^a-zA-Z0-9.\-_ ]/g, '').replace(/\s+/g, ' ');
  return safe.slice(0, maxLen) || 'file';
}

export function caseDocumentFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  if ((ALLOWED_CASE_DOCUMENT_MIMES as readonly string[]).includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new Error(`File type not allowed: ${file.mimetype}`));
}

export function pdfOnlyFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  if ((ALLOWED_AI_PDF_MIMES as readonly string[]).includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new Error('Only PDF uploads are allowed'));
}
