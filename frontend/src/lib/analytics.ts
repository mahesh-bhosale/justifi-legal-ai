import api from './api';

// ---- Shared types ----

export interface TimeSeriesPoint {
  label: string;
  count: number;
}

export interface KeyValueCount {
  label: string;
  count: number;
}

// ---- Admin analytics ----

export const fetchAdminOverview = async () => {
  const res = await api.get('/api/analytics/admin/overview');
  return res.data.data as {
    totalUsers: number;
    totalCases: number;
    totalLawyers: number;
    totalCitizens: number;
  };
};

export const fetchAdminUsersGrowth = async (): Promise<TimeSeriesPoint[]> => {
  const res = await api.get('/api/analytics/admin/users-growth');
  return res.data.data;
};

export const fetchAdminCasesTrend = async (): Promise<TimeSeriesPoint[]> => {
  const res = await api.get('/api/analytics/admin/cases-trend');
  return res.data.data;
};

export const fetchAdminLawyerActivity = async () => {
  const res = await api.get('/api/analytics/admin/lawyer-activity');
  return res.data.data as {
    lawyerId: string | null;
    lawyerName: string;
    caseCount: number;
  }[];
};

// ---- Lawyer analytics ----

export const fetchLawyerDashboard = async () => {
  const res = await api.get('/api/analytics/lawyer/dashboard');
  return res.data.data as {
    activeCases: number;
    totalCases: number;
    completedCases: number;
    averageRating: number | null;
  };
};

export const fetchLawyerCaseStats = async () => {
  const res = await api.get('/api/analytics/lawyer/case-stats');
  return res.data.data as { status: string; count: number }[];
};

export const fetchLawyerProposalSuccess = async () => {
  const res = await api.get('/api/analytics/lawyer/proposal-success');
  return res.data.data as { status: string; count: number }[];
};

export const fetchLawyerReviews = async () => {
  const res = await api.get('/api/analytics/lawyer/reviews');
  return res.data.data as { rating: number; createdAt: string }[];
};

// ---- Citizen analytics ----

export const fetchCitizenDashboard = async () => {
  const res = await api.get('/api/analytics/citizen/dashboard');
  return res.data.data as {
    totalCases: number;
    activeCases: number;
    resolvedCases: number;
    predictionCount: number;
  };
};

export const fetchCitizenCaseHistory = async () => {
  const res = await api.get('/api/analytics/citizen/case-history');
  return res.data.data as {
    id: number;
    status: string;
    createdAt: string;
  }[];
};

export const fetchCitizenPredictionUsage = async () => {
  const res = await api.get('/api/analytics/citizen/prediction-usage');
  return res.data.data as {
    date: string;
    count: number;
  }[];
};

// ---- AI analytics ----

export const fetchAIModelPerformance = async () => {
  const res = await api.get('/api/analytics/ai/model-performance');
  return res.data.data as {
    totalPredictions: number;
    outcomeDistribution: { prediction: string; count: number }[];
    confidenceBuckets: { bucket: string; count: number }[];
  };
};

export const fetchAISummarizationStats = async () => {
  const res = await api.get('/api/analytics/ai/summarization-stats');
  return res.data.data as {
    endpoint: string;
    totalUsage: number;
  }[];
};

