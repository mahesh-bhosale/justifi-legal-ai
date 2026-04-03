import { supabase, CASE_DOCUMENTS_BUCKET, AVATARS_BUCKET } from '../utils/supabaseClient';

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

export async function uploadAvatar(options: {
  userId: string;
  fileBuffer: Buffer;
  mimeType: string;
}): Promise<StorageUploadResult> {
  if (!supabase) {
    throw new Error('Supabase client is not configured');
  }

  // avatars/lawyers/{userId}.png
  const path = `lawyers/${options.userId}.png`;

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, options.fileBuffer, {
      contentType: 'image/png', // Always save as png as per requirement
      upsert: true, // Overwrite if exists
    });

  if (error) {
    console.error('Supabase Avatar upload error:', error);
    throw new Error('Failed to upload avatar to storage');
  }

  // Get public URL with cache-busting timestamp
  const { data } = supabase.storage
    .from(AVATARS_BUCKET)
    .getPublicUrl(path);

  // Add cache-busting timestamp to prevent browser/CDN caching
  const timestamp = Date.now();
  const publicUrl = `${data.publicUrl}?t=${timestamp}`;

  return { path: publicUrl };
}

export async function generateSignedUrl(options: {
  path: string;
  expiresInSeconds?: number;
  downloadFileName?: string;
}): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase client is not configured');
  }

  const expiresIn = options.expiresInSeconds ?? 60;

  // IMPORTANT:
  // Do NOT pass 3rd-party "download" options to `createSignedUrl`.
  // Your current supabase-js version throws:
  // `Cannot read properties of undefined (reading 'handleOperation')`
  // when called with the unsupported signature.
  const { data, error } = await supabase.storage
    .from(CASE_DOCUMENTS_BUCKET)
    .createSignedUrl(options.path, expiresIn);

  if (error || !data?.signedUrl) {
    console.error('Supabase Storage signed URL error:', error);
    throw new Error('Failed to generate signed URL');
  }

  // Fallback: if `downloadFileName` is provided, append `download=` query param.
  // Some browsers/signed-url handlers will interpret this and trigger download behavior.
  if (options.downloadFileName && typeof data.signedUrl === 'string' && !data.signedUrl.includes('download=')) {
    const join = data.signedUrl.includes('?') ? '&' : '?';
    return `${data.signedUrl}${join}download=${encodeURIComponent(options.downloadFileName)}`;
  }

  return data.signedUrl as string;
}

