import api from './api';

export interface RankedLawyerProfile {
  id: number;
  userId: string;
  specializations: string[];
  yearsExperience: number;
  bio: string;
  officeAddress: string;
  serviceAreas: string[];
  languages: string[];
  hourlyRate: number | null;
  availabilityStatus: 'available' | 'limited' | 'unavailable';
  rating: string | number | null;
  casesHandled: number | null;
  successRate: string | null;
  verified: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  score: number;
}

export interface LawyerSearchFilters {
  specialization?: string[];
  city?: string;
  minYears?: number;
  maxRate?: number;
  languages?: string[];
  availability?: 'available' | 'limited' | 'unavailable';
  minRating?: number;
  limit?: number;
  offset?: number;
}

// Search lawyers with ranking
export const searchLawyers = async (filters?: LawyerSearchFilters): Promise<RankedLawyerProfile[]> => {
  const params = new URLSearchParams();
  
  if (filters?.specialization) {
    params.append('specialization', filters.specialization.join(','));
  }
  if (filters?.city) {
    params.append('city', filters.city);
  }
  if (filters?.minYears) {
    params.append('minYears', filters.minYears.toString());
  }
  if (filters?.maxRate) {
    params.append('maxRate', filters.maxRate.toString());
  }
  if (filters?.languages) {
    params.append('languages', filters.languages.join(','));
  }
  if (filters?.availability) {
    params.append('availability', filters.availability);
  }
  if (filters?.minRating) {
    params.append('minRating', filters.minRating.toString());
  }
  if (filters?.limit) {
    params.append('limit', filters.limit.toString());
  }
  if (filters?.offset) {
    params.append('offset', filters.offset.toString());
  }

  const response = await api.get(`/api/lawyers/search?${params.toString()}`);
  return response.data.data;
};
