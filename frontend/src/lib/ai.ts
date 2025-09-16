// AI API functions for summarization and chat functionality
import axios from 'axios';
import { getToken, removeToken } from './auth';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai`;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    // Don't override Content-Type for FormData (needed for file uploads)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found');
      // Don't redirect here, let the component handle it
      return Promise.reject(new Error('Authentication token not found'));
    }
    
    console.log('Sending request to:', config.url);
    console.log('Request headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('Received response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      });
      
      if (error.response.status === 401) {
        // Token expired or invalid
        console.log('Authentication error');
        removeToken();
        // Don't redirect here, let the component handle it
        return Promise.reject(new Error('Your session has expired. Please log in again.'));
      }
      
      // Handle other error statuses
      const errorMessage = error.response.data?.error || error.response.statusText || 'An error occurred';
      return Promise.reject(new Error(errorMessage));
      
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return Promise.reject(new Error('No response received from server. Please check your connection.'));
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
      return Promise.reject(error);
    }
  }
);

// Types
export interface SummaryRequest {
  text: string;
  level: 'short' | 'medium' | 'long' | 'very_long';
}

export interface SummaryResponse {
  summary: string;
  level: string;
  status: string;
  rateLimit?: {
    limit: number;
    used: number;
    remaining: number;
  };
}

export interface ChatRequest {
  question: string;
  context: string;
}

export interface ChatResponse {
  answer: string;
  rateLimit?: {
    limit: number;
    used: number;
    remaining: number;
  };
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// Text summarization
export const summarizeText = async (request: SummaryRequest, role?: 'citizen' | 'lawyer'): Promise<SummaryResponse> => {
  const endpoint = role ? `/${role}/summarize` : '/summarize/text';
  try {
    const response = await api.post<SummaryResponse>(endpoint, {
      text: request.text,
      level: request.level
    });
    return response.data;
  } catch (error) {
    console.error('Error in summarizeText:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to summarize text');
    }
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
};

// PDF summarization
export const summarizePDF = async (file: File, level: string = 'short'): Promise<SummaryResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('level', level);

    const response = await api.post<SummaryResponse>('/summarize/pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error in summarizePDF:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to summarize PDF');
    }
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
};

// Ask question about text
export const askAboutText = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    console.log('Sending question:', request.question);
    console.log('With context length:', request.context?.length || 0);
    
    const token = getToken();
    if (!token) {
      console.error('No authentication token found');
      // Don't redirect here, let the component handle it
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await api.post<ChatResponse>('/ask/text', {
      question: request.question,
      context: request.context || ''
    });
    
    console.log('Received response for question:', request.question);
    return response.data || { answer: 'No response from server' };
  } catch (error) {
    console.error('Error in askAboutText:', error);
    
    if (axios.isAxiosError(error)) {
      // The interceptor already handled the error, just rethrow it
      throw error;
    }
    
    // For non-Axios errors, ensure we have a proper Error object
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    throw new Error(errorMessage);
  }
};

// Ask question about PDF
export const askAboutPDF = async (file: File, question: string): Promise<ChatResponse> => {
  try {
    console.log('Sending PDF question:', question);
    console.log('File info:', { name: file.name, size: file.size, type: file.type });
    
    const token = getToken();
    if (!token) {
      console.error('No authentication token found');
      // Don't redirect here, let the component handle it
      throw new Error('Authentication required. Please log in again.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('question', question);

    const response = await api.post<ChatResponse>('/ask/pdf', formData);
    
    console.log('Received response for PDF question:', question);
    return response.data || { answer: 'No response from server' };
  } catch (error) {
    console.error('Error in askAboutPDF:', error);
    
    if (axios.isAxiosError(error)) {
      // The interceptor already handled the error, just rethrow it
      throw error;
    }
    
    // For non-Axios errors, ensure we have a proper Error object
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    throw new Error(errorMessage);
  }
};

// Public demo summarization (no auth required)
export const summarizeTextDemo = async (text: string, level: string = 'short'): Promise<SummaryResponse> => {
  try {
    const response = await axios.post<SummaryResponse>(`${API_BASE}/public/summarize`, 
      { text, level },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error) {
    console.error('Error in summarizeTextDemo:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to summarize text');
    }
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
};

// Utility functions
export const downloadTextFile = (content: string, filename: string = 'summary.txt') => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// Generate unique ID for chat messages
export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};