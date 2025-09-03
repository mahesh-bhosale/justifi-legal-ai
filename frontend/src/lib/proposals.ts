import api from './api';

export interface CaseProposal {
  id: number;
  caseId: number;
  lawyerId: string;
  proposalText: string;
  proposedFee?: number;
  estimatedDuration?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProposalInput {
  proposalText: string;
  proposedFee?: number;
  estimatedDuration?: string;
}

export interface ProposalStatusUpdate {
  status: 'accepted' | 'rejected';
}

// Create a proposal for a case
export const createProposal = async (caseId: number, data: CreateProposalInput): Promise<CaseProposal> => {
  const response = await api.post(`/api/cases/${caseId}/proposals`, data);
  return response.data.data;
};

// Get proposals for a specific case
export const getCaseProposals = async (caseId: number): Promise<CaseProposal[]> => {
  const response = await api.get(`/api/cases/${caseId}/proposals`);
  return response.data.data;
};

// Update proposal status (accept/reject)
export const updateProposalStatus = async (id: number, status: 'accepted' | 'rejected'): Promise<{ proposal: CaseProposal; updatedCase?: any }> => {
  const response = await api.patch(`/api/proposals/${id}/status`, { status });
  return response.data.data;
};

// Withdraw a proposal
export const withdrawProposal = async (id: number): Promise<CaseProposal> => {
  const response = await api.patch(`/api/proposals/${id}/withdraw`);
  return response.data.data;
};
