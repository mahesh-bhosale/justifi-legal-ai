import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, getRefreshToken, setTokens, removeToken } from './auth';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshWaitQueue: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshWaitQueue.push(cb);
}

function onRefreshed(token: string | null) {
  refreshWaitQueue.forEach((cb) => cb(token));
  refreshWaitQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!original || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const url = `${original.baseURL || ''}${original.url || ''}`;
    if (
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/signup') ||
      url.includes('/api/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    if (original._retry) {
      if (typeof window !== 'undefined') {
        removeToken();
        window.location.href = '/auth/login';
      }
      return Promise.reject(error);
    }

    const refresh = getRefreshToken();
    if (!refresh) {
      if (typeof window !== 'undefined') {
        removeToken();
        window.location.href = '/auth/login';
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (token) {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          } else {
            reject(error);
          }
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<{
        success?: boolean;
        data?: { token?: string; refreshToken?: string };
      }>(
        `${API_BASE_URL}/api/auth/refresh`,
        { refreshToken: refresh },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const newAccess = data?.data?.token;
      const newRefresh = data?.data?.refreshToken;
      if (!newAccess) {
        throw new Error('No access token in refresh response');
      }

      setTokens(newAccess, newRefresh || refresh);
      onRefreshed(newAccess);
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (e) {
      onRefreshed(null);
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
