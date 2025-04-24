import { store } from '@/app/store';
import { logout } from '@/features/auth/authSlice';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const url = error.config?.url;

    // Skip refresh for login or refresh-token requests
    if (
      status === 401 &&
      url !== '/auth/login' &&
      url !== '/auth/refresh-token' &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // Queue the request until the token is refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh-token endpoint
        await api.post('/auth/refresh-token');
        // On success, Axios will automatically update cookies (accessToken and refreshToken)
        processQueue(null);
        return api(originalRequest); // Retry the original request
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        // If refresh fails, log out and redirect to login
        store.dispatch(logout());
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;