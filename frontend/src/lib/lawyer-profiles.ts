import api from './api';

export interface Education {
  degree: string;
  university: string;
  year: number;
  field?: string;
}

export interface BarAdmission {
  state: string;
  year: number;
  barNumber?: string;
}

export interface LawyerProfile {
  id: number;
  userId: string;
  specializations: string[];
  yearsExperience: number;
  bio: string;
  officeAddress: string;
  serviceAreas: string[];
  languages: string[];
  education: Education[];
  barAdmissions: BarAdmission[];
  hourlyRate?: number;
  consultationFee?: number;
  availabilityStatus: 'available' | 'limited' | 'unavailable';
  rating: number;
  casesHandled: number;
  successRate: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateLawyerProfileData {
  specializations: string[];
  yearsExperience: number;
  bio: string;
  officeAddress: string;
  serviceAreas: string[];
  languages: string[];
  education: Education[];
  barAdmissions: BarAdmission[];
  hourlyRate?: number;
  consultationFee?: number;
  availabilityStatus?: 'available' | 'limited' | 'unavailable';
}

export interface LawyerProfileFilters {
  specializations?: string[];
  serviceAreas?: string[];
  languages?: string[];
  minExperience?: number;
  maxExperience?: number;
  minHourlyRate?: number;
  maxHourlyRate?: number;
  availabilityStatus?: string;
  minRating?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
  errors?: unknown[];
}

// Lawyer Profile API functions
export const lawyerProfileApi = {
  // Create a new lawyer profile
  createProfile: async (data: CreateLawyerProfileData): Promise<ApiResponse<LawyerProfile>> => {
    const response = await api.post('/api/lawyer-profiles', data);
    return response.data;
  },

  // Update an existing lawyer profile
  updateProfile: async (id: number, data: Partial<CreateLawyerProfileData>): Promise<ApiResponse<LawyerProfile>> => {
    const response = await api.patch(`/api/lawyer-profiles/${id}`, data);
    return response.data;
  },

  // Get a specific lawyer profile
  getProfile: async (id: number): Promise<ApiResponse<LawyerProfile>> => {
    const response = await api.get(`/api/lawyer-profiles/${id}`);
    return response.data;
  },

  // Get current user's lawyer profile
  getMyProfile: async (): Promise<ApiResponse<LawyerProfile>> => {
    const response = await api.get('/api/lawyer-profiles/me/profile');
    return response.data;
  },

  // Get all lawyer profiles with filters
  getProfiles: async (filters?: LawyerProfileFilters): Promise<ApiResponse<LawyerProfile[]>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await api.get(`/api/lawyer-profiles?${params.toString()}`);
    return response.data;
  },

  // Verify a lawyer profile (admin only)
  verifyProfile: async (id: number): Promise<ApiResponse<LawyerProfile>> => {
    const response = await api.patch(`/api/lawyer-profiles/${id}/verify`);
    return response.data;
  },

  // Get available specializations
  getSpecializations: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get('/api/lawyer-profiles/specializations');
    return response.data;
  },

  // Get available service areas
  getServiceAreas: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get('/api/lawyer-profiles/service-areas');
    return response.data;
  },

  // Get available languages
  getLanguages: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get('/api/lawyer-profiles/languages');
    return response.data;
  },
};

export default lawyerProfileApi;
