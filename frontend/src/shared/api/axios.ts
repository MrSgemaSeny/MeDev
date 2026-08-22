import axios from 'axios';
import { useAuthStore } from '../../entities/user/model/store';

export const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://medev-backend.onrender.com/api/v1' : 'http://localhost:8080/api/v1');

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Interceptor для подстановки токена
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor для рефреша токена
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.set('Authorization', `Bearer ${token}`);
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });
        
        useAuthStore.getState().setTokens(data.accessToken, ''); // HttpOnly cookie manages refresh token
        originalRequest.headers.set('Authorization', `Bearer ${data.accessToken}`);
        
        processQueue(null, data.accessToken);
        
        return api(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) {
          useAuthStore.getState().logout();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    // Handle desynced token state (valid token, but user/profile deleted from DB)
    if (error.response?.status === 404 && originalRequest.url?.includes('/profile')) {
      useAuthStore.getState().logout();
      window.location.href = '/';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
