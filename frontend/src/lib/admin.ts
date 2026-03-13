import api from './api';

export interface AdminUsersResponse {
  citizens: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    verified: boolean | null;
    createdAt: string | null;
  }[];
  lawyers: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    verified: boolean | null;
    createdAt: string | null;
  }[];
  admins: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    verified: boolean | null;
    createdAt: string | null;
  }[];
}

export const fetchAdminUsers = async (): Promise<AdminUsersResponse> => {
  const response = await api.get('/api/users');
  return response.data.data;
};

