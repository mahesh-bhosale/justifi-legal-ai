import api from './api';

export interface CaseMessage {
  id: number;
  caseId: number;
  senderId: string;
  senderType?: 'citizen' | 'lawyer' | 'admin';
  recipientId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TypingStatus {
  isTyping: boolean;
  userId: string;
  userName?: string;
  lastTypingTime?: Date;
}

export interface CreateMessageInput {
  recipientId: string;
  message: string;
}

// Send a message in a case
export const sendMessage = async (caseId: number, data: CreateMessageInput): Promise<CaseMessage> => {
  console.log('Sending message to API:', { caseId, data });
  try {
    const response = await api.post(`/api/cases/${caseId}/messages`, data);
    console.log('Message API response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get messages for a specific case
export const getCaseMessages = async (caseId: number): Promise<CaseMessage[]> => {
  console.log('Fetching messages from API for case:', caseId);
  try {
    const response = await api.get(`/api/cases/${caseId}/messages`);
    console.log('Messages API response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Mark a message as read
export const markMessageAsRead = async (id: number): Promise<CaseMessage> => {
  const response = await api.patch(`/api/messages/${id}/read`);
  return response.data.data;
};
