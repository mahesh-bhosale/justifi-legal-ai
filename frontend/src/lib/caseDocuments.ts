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

