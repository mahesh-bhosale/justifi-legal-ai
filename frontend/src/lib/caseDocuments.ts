import api from './api';

export interface CaseDocument {
  id: number;
  caseId: number;
  uploadedBy: string;
  uploadedByName?: string | null;
  fileUrl: string;
  fileName: string;
  mimeType?: string | null;
  fileSize?: number | null;
  description?: string | null;
  createdAt: string;
}

export interface UploadDocumentInput {
  file: File;
  description?: string;
}

export const uploadDocument = async (
  caseId: number,
  input: UploadDocumentInput
): Promise<CaseDocument> => {
  const formData = new FormData();
  formData.append('file', input.file);
  if (input.description) {
    formData.append('description', input.description);
  }

  const response = await api.post(`/api/cases/${caseId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

export const fetchCaseDocuments = async (caseId: number): Promise<CaseDocument[]> => {
  const response = await api.get(`/api/cases/${caseId}/documents`);
  return response.data.data;
};

export const generateSignedUrl = async (
  caseId: number,
  documentId: number
): Promise<string> => {
  const response = await api.get(`/api/cases/${caseId}/documents/${documentId}/url`);
  return response.data.url as string;
};

type Disposition = 'inline' | 'attachment';

export const getDocumentUrl = async (
  caseId: number,
  documentId: number,
  options: { disposition: Disposition }
): Promise<{ url: string; fileName?: string; mimeType?: string }> => {
  const response = await api.get(`/api/cases/${caseId}/documents/${documentId}/url`, {
    params: { disposition: options.disposition },
  });
  return {
    url: response.data.url as string,
    fileName: response.data.fileName as string | undefined,
    mimeType: response.data.mimeType as string | undefined,
  };
};

export const getViewUrl = async (
  caseId: number,
  doc: Pick<CaseDocument, 'id' | 'fileName' | 'mimeType'>
): Promise<string> => {
  const { url, mimeType } = await getDocumentUrl(caseId, doc.id, { disposition: 'inline' });
  const type = (doc.mimeType || mimeType || '').toLowerCase();

  // Word docs: open in a browser tab using Google Docs viewer.
  if (
    type === 'application/msword' ||
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    doc.fileName.toLowerCase().endsWith('.doc') ||
    doc.fileName.toLowerCase().endsWith('.docx')
  ) {
    return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;
  }

  // PDFs and other types: just open the signed URL in a new tab.
  return url;
};

export const getDownloadUrl = async (
  caseId: number,
  documentId: number
): Promise<string> => {
  const { url } = await getDocumentUrl(caseId, documentId, { disposition: 'attachment' });
  return url;
};

