import axios from 'axios';
import { useAuthStore } from '../../entities/user/model/store';

// Для простоты, пока бэкенд на локалхосте.
// В проде baseURL будет заменен на относительный путь или из env
export const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
});

// Interceptor для подстановки токена
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor для рефреша токена
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Если ошибка 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }
        
        const { data } = await axios.post('http://localhost:8080/api/v1/auth/refresh', {
          refreshToken,
        });
        
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
