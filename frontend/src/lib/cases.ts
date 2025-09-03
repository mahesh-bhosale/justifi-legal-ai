import api from './api';

export interface Case {
  id: number;
  citizenId: string;
  lawyerId?: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  urgency: 'low' | 'medium' | 'high';
  preferredLanguage?: string;
  location?: string;
  budget?: number;
  nextHearingDate?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCaseInput {
  title: string;
  description: string;
  category: string;
  urgency?: 'low' | 'medium' | 'high';
  preferredLanguage?: string;
  location?: string;
  budget?: number;
}

export interface UpdateCaseInput {
  title?: string;
  description?: string;
  category?: string;
  urgency?: 'low' | 'medium' | 'high';
  preferredLanguage?: string;
  location?: string;
  budget?: number;
  status?: 'pending' | 'in_progress' | 'resolved' | 'closed';
  nextHearingDate?: string;
  resolution?: string;
}

export interface CaseFilters {
  open?: boolean;
  status?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface CaseStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
}

// Create a new case
export const createCase = async (data: CreateCaseInput): Promise<Case> => {
  const response = await api.post('/api/cases', data);
  return response.data.data;
};

// Get cases based on user role
export const getCases = async (filters?: CaseFilters): Promise<Case[]> => {
  const params = new URLSearchParams();
  if (filters?.open !== undefined) params.append('open', filters.open.toString());
  if (filters?.status) params.append('status', filters.status);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());

  const response = await api.get(`/api/cases?${params.toString()}`);
  return response.data.data;
};

// Get a specific case by ID
export const getCaseById = async (id: number): Promise<Case> => {
  const response = await api.get(`/api/cases/${id}`);
  return response.data.data;
};

// Update a case
export const updateCase = async (id: number, data: UpdateCaseInput): Promise<Case> => {
  const response = await api.patch(`/api/cases/${id}`, data);
  return response.data.data;
};

// Assign a case to a lawyer
export const assignCase = async (id: number, lawyerId: string): Promise<Case> => {
  const response = await api.patch(`/api/cases/${id}/assign`, { lawyerId });
  return response.data.data;
};

// Get case statistics (admin only)
export const getCaseStats = async (): Promise<CaseStats> => {
  const response = await api.get('/api/cases/stats/admin');
  return response.data.data;
};
