import api from './api';

export interface Review {
  id: number;
  caseId: number;
  lawyerId: string;
  citizenId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewInput {
  caseId: number;
  lawyerId: string;
  rating: number;
  comment: string;
}

export interface LawyerReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

// Create a review for a lawyer after case resolution
export const createReview = async (data: CreateReviewInput): Promise<Review> => {
  const response = await api.post('/api/reviews', data);
  return response.data.data;
};

// Get reviews for a specific lawyer
export const getLawyerReviews = async (lawyerId: string): Promise<Review[]> => {
  const response = await api.get(`/api/reviews/lawyer/${lawyerId}`);
  return response.data.data;
};

// Get review statistics for a lawyer
export const getLawyerReviewStats = async (lawyerId: string): Promise<LawyerReviewStats> => {
  const response = await api.get(`/api/reviews/lawyer/${lawyerId}/stats`);
  return response.data.data;
};

// Get reviews for a specific case
export const getCaseReviews = async (caseId: number): Promise<Review[]> => {
  const response = await api.get(`/api/reviews/case/${caseId}`);
  return response.data.data;
};

// Update a review
export const updateReview = async (id: number, data: Partial<CreateReviewInput>): Promise<Review> => {
  const response = await api.patch(`/api/reviews/${id}`, data);
  return response.data.data;
};

// Delete a review
export const deleteReview = async (id: number): Promise<void> => {
  await api.delete(`/api/reviews/${id}`);
};


