import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import tokenStorageManager from '@/storage/tokenStorage/tokenStorageManager';
import { navigate } from '@/services/NavigationService';

interface ExtendAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry: boolean;
}

let tokenRefreshing = false;

let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: ExtendAxiosRequestConfig;
}[] = [];

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_DEV_BACKEND_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendAxiosRequestConfig;

    // If error is 401 and we haven't tried refreshing the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (tokenRefreshing) {
        // If refresh is in progress, add request to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      tokenRefreshing = true;

      try {
        const accessToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue();

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        await tokenStorageManager.deleteRefreshToken();
        processQueue(refreshError);
        console.log('Session expired. Please log in again.');
        navigate('LoginScreen', { message: 'Session expired. Please log in again.' });
        return Promise.reject(refreshError);
      } finally {
        tokenRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const refreshToken = async () => {
  try {
    const refreshToken = await tokenStorageManager.getRefreshToken();
    console.log('axiosInstance Refresh token', refreshToken);
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_DEV_BACKEND_API_URL}${process.env.EXPO_PUBLIC_API_REFRESH_TOKEN}`,
      {
        refresh_token: refreshToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    tokenStorageManager.setAccessToken(response.data.access_token);

    return response.data;
  } catch (error) {
    throw error;
  }
};

const processQueue = (error: any = null): void => {
  failedQueue.forEach(request => {
    if (error) {
      request.reject(error);
    } else {
      request.resolve(axiosInstance(request.config));
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  async config => {
    const token = await tokenStorageManager.getAccessToken();

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
