import { supabase, CASE_DOCUMENTS_BUCKET } from '../utils/supabaseClient';

export interface StorageUploadResult {
  path: string;
}

export async function uploadDocument(options: {
  caseId: number;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<StorageUploadResult> {
  if (!supabase) {
    throw new Error('Supabase client is not configured');
  }

  const timestamp = Date.now();
  const safeFileName = options.fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `case_${options.caseId}/${timestamp}_${safeFileName}`;

  const { error } = await supabase.storage
    .from(CASE_DOCUMENTS_BUCKET)
    .upload(path, options.fileBuffer, {
      contentType: options.mimeType,
      upsert: false,
    });

  if (error) {
    console.error('Supabase Storage upload error:', error);
    throw new Error('Failed to upload document to storage');
  }

  return { path };
}

export async function generateSignedUrl(options: {
  path: string;
  expiresInSeconds?: number;
}): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase client is not configured');
  }

  const expiresIn = options.expiresInSeconds ?? 60;

  const { data, error } = await supabase.storage
    .from(CASE_DOCUMENTS_BUCKET)
    .createSignedUrl(options.path, expiresIn);

  if (error || !data?.signedUrl) {
    console.error('Supabase Storage signed URL error:', error);
    throw new Error('Failed to generate signed URL');
  }

  return data.signedUrl;
}

