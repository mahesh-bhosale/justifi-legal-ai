import api from './api';

export type CaseStatus =
  | 'pending'
  | 'pending_lawyer_acceptance'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'rejected';

export interface Case {
  id: number;
  citizenId: string;
  lawyerId?: string;
  preferredLawyerId?: string;
  title: string;
  description: string;
  category: string;
  status: CaseStatus;
  urgency: 'low' | 'medium' | 'high';
  preferredLanguage?: string;
  location?: string;
  budget?: number;
  nextHearingDate?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

/** Present on admin list responses (joined from users). */
export interface CaseWithNames extends Case {
  citizenName?: string;
  lawyerName?: string | null;
}

/** Citizen withdraw modal presets (must match UX copy). */
export const WITHDRAW_REASON_PRESETS = [
  'Found a solution on my own',
  'The proposed fees were too expensive',
  'I made a mistake while posting',
  'I found a different lawyer outside the platform',
  'Other',
] as const;

/** Readable resolution / withdrawal text for closed cases. */
export function formatResolutionDisplay(resolution: string | undefined, status: string): string | null {
  if (!resolution) return null;
  if (status === 'closed' && resolution.startsWith('WITHDRAWAL_REASON:')) {
    return resolution.replace(/^WITHDRAWAL_REASON:\s*/, '').trim();
  }
  return resolution;
}

export function caseStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'pending_lawyer_acceptance':
      return 'Awaiting Lawyer';
    case 'in_progress':
      return 'In Progress';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
}

export interface CreateCaseInput {
  title: string;
  description: string;
  category: string;
  urgency?: 'low' | 'medium' | 'high';
  preferredLanguage?: string;
  location?: string;
  budget?: number;
  preferredLawyerId?: string;
}

export interface UpdateCaseInput {
  title?: string;
  description?: string;
  category?: string;
  urgency?: 'low' | 'medium' | 'high';
  preferredLanguage?: string;
  location?: string;
  budget?: number;
  status?: CaseStatus;
  nextHearingDate?: string;
  resolution?: string;
}

export interface CaseFilters {
  open?: boolean;
  status?: string;
  category?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface CaseStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  closed: number;
  rejected: number;
}

export interface CaseAuditEntry {
  id: number;
  caseId: number;
  updatedBy: string;
  updatedByName: string | null;
  updateType: string;
  description: string;
  createdAt: string;
}

// Create a new case
export const createCase = async (data: CreateCaseInput): Promise<Case> => {
  const response = await api.post('/api/cases', data);
  return response.data.data;
};

// Get cases based on user role
export const getCases = async (filters?: CaseFilters): Promise<CaseWithNames[]> => {
  const params = new URLSearchParams();
  if (filters?.open !== undefined) params.append('open', filters.open.toString());
  if (filters?.status) params.append('status', filters.status);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());
  if (filters?.search?.trim()) params.append('search', filters.search.trim());

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

export const resolveCase = async (caseId: number, resolution: string): Promise<Case> => {
  const response = await api.patch(`/api/cases/${caseId}/resolve`, { resolution });
  return response.data.data;
};

export const terminateCase = async (caseId: number): Promise<Case> => {
  const response = await api.patch(`/api/cases/${caseId}/terminate`, {});
  return response.data.data;
};

export const withdrawCase = async (caseId: number, reason: string, note?: string): Promise<Case> => {
  const response = await api.patch(`/api/cases/${caseId}/withdraw`, { reason, note });
  return response.data.data;
};

export const deleteCase = async (caseId: number): Promise<void> => {
  await api.delete(`/api/cases/${caseId}`);
};

export const getCaseAuditLog = async (caseId: number): Promise<CaseAuditEntry[]> => {
  const response = await api.get(`/api/cases/${caseId}/updates`);
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

// Get direct contact requests (lawyer only)
export const getDirectContactRequests = async (): Promise<Case[]> => {
  const response = await api.get('/api/cases/direct-requests');
  return response.data.data;
};

// Accept direct contact request (lawyer only)
export const acceptDirectContact = async (caseId: number): Promise<Case> => {
  const response = await api.patch(`/api/cases/${caseId}/accept`);
  return response.data.data;
};

// Reject direct contact request (lawyer only)
export const rejectDirectContact = async (caseId: number): Promise<Case> => {
  const response = await api.patch(`/api/cases/${caseId}/reject`);
  return response.data.data;
};
