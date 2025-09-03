import api from './api';

export interface CaseDocument {
  id: number;
  caseId: number;
  uploadedBy: string;
  fileUrl: string;
  fileName: string;
  mimeType?: string;
  fileSize?: number;
  description?: string;
  createdAt: string;
}

export interface UploadDocumentInput {
  file: File;
  description?: string;
}

// Upload a document for a case
export const uploadDocument = async (caseId: number, data: UploadDocumentInput): Promise<CaseDocument> => {
  const formData = new FormData();
  formData.append('file', data.file);
  if (data.description) {
    formData.append('description', data.description);
  }

  const response = await api.post(`/api/cases/${caseId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

// Get documents for a specific case
export const getCaseDocuments = async (caseId: number): Promise<CaseDocument[]> => {
  const response = await api.get(`/api/cases/${caseId}/documents`);
  return response.data.data;
};
