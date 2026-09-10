
import { useAuthStore } from '../../entities/user/model/store';

export const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://medev-backend.onrender.com/api/v1' : 'http://localhost:8080/api/v1');

class ApiError extends Error {
  response?: any;
  config?: any;
  constructor(message: string, response?: any, config?: any) {
    super(message);
    this.name = 'ApiError';
    this.response = response;
    this.config = config;
  }
}

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

async function customFetch(endpoint: string, options: RequestInit = {}, retry = false): Promise<any> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  const token = useAuthStore.getState().accessToken;
  const headers = new Headers(options.headers || {});
  headers.set('X-Requested-With', 'XMLHttpRequest');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!options.body || !(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  } else if (options.body instanceof FormData) {
    // Let browser set content type with boundary
    headers.delete('Content-Type');
  }

  options.credentials = 'include';
  options.headers = headers;

  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (err: any) {
    throw new ApiError(err.message || 'Network Error', { status: 0 }, { url, ...options });
  }

  const isAuthEndpoint = url.includes('/auth/logout') ||
                         url.includes('/auth/refresh') ||
                         url.includes('/auth/login') ||
                         url.includes('/auth/register');

  if (response.status === 401 && !retry && !isAuthEndpoint) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => {
        return customFetch(endpoint, options, true);
      }).catch((err) => Promise.reject(err));
    }

    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      
      if (!refreshRes.ok) {
        throw new Error('Refresh failed');
      }
      
      const data = await refreshRes.json();
      useAuthStore.getState().setTokens(data.accessToken, '');
      processQueue(null, data.accessToken);
      
      return customFetch(endpoint, options, true);
    } catch (refreshError: any) {
      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      throw new ApiError('Unauthorized', { status: 401, data: null });
    } finally {
      isRefreshing = false;
    }
  }

  if (response.status === 404 && url.includes('/profile')) {
    useAuthStore.getState().logout();
    window.location.href = import.meta.env.BASE_URL;
    throw new ApiError('Profile not found', { status: 404, data: null });
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else if (contentType && contentType.includes('application/pdf')) {
      data = await response.blob();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorObj = new ApiError(`Request failed with status ${response.status}`, { status: response.status, data }, { url, ...options });
    throw errorObj;
  }

  return { data, status: response.status, headers: response.headers };
}

export const api = {
  get: <T = any>(url: string, config?: any): Promise<{ data: T; status: number; headers: Headers }> =>
    customFetch(url, { ...config, method: 'GET' }) as Promise<{ data: T; status: number; headers: Headers }>,
  post: <T = any>(url: string, data?: any, config?: any): Promise<{ data: T; status: number; headers: Headers }> =>
    customFetch(url, { ...config, method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) }) as Promise<{ data: T; status: number; headers: Headers }>,
  put: <T = any>(url: string, data?: any, config?: any): Promise<{ data: T; status: number; headers: Headers }> =>
    customFetch(url, { ...config, method: 'PUT', body: data instanceof FormData ? data : JSON.stringify(data) }) as Promise<{ data: T; status: number; headers: Headers }>,
  delete: <T = any>(url: string, config?: any): Promise<{ data: T; status: number; headers: Headers }> =>
    customFetch(url, { ...config, method: 'DELETE' }) as Promise<{ data: T; status: number; headers: Headers }>,
};
