import api from './api';

export interface CaseMessage {
  id: number;
  caseId: number;
  senderId: string;
  recipientId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateMessageInput {
  recipientId: string;
  message: string;
}

// Send a message in a case
export const sendMessage = async (caseId: number, data: CreateMessageInput): Promise<CaseMessage> => {
  const response = await api.post(`/api/cases/${caseId}/messages`, data);
  return response.data.data;
};

// Get messages for a specific case
export const getCaseMessages = async (caseId: number): Promise<CaseMessage[]> => {
  const response = await api.get(`/api/cases/${caseId}/messages`);
  return response.data.data;
};

// Mark a message as read
export const markMessageAsRead = async (id: number): Promise<CaseMessage> => {
  const response = await api.patch(`/api/messages/${id}/read`);
  return response.data.data;
};
