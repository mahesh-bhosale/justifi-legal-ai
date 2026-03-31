import api from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  createdAt: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const profileApi = {
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const res = await api.get('/api/profile');
    return res.data;
  },

  updateProfile: async (
    data: Partial<Pick<UserProfile, 'name'>>,
  ): Promise<ApiResponse<UserProfile>> => {
    const res = await api.patch('/api/profile', data);
    return res.data;
  },

  changePassword: async (body: { currentPassword: string; newPassword: string }) => {
    const res = await api.post('/api/profile/change-password', body);
    return res.data as { success: boolean; message?: string };
  },
};

