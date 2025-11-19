/**
 * API Client 설정
 * Axios 인스턴스를 생성하고 인터셉터를 설정합니다.
 */

import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import type { AuthResponse } from '../types/auth';
import { ENDPOINTS } from './endpoints';

// API 기본 URL 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let refreshTokenRequest: Promise<string | null> | null = null;

const fetchNewAccessToken = async () => {
  console.info('토큰 만료로 재발급받습니다.');
  const response = await refreshClient.post<AuthResponse>(ENDPOINTS.AUTH.REFRESH);
  const newToken = response.data.token;
  localStorage.setItem('token', newToken);
  return newToken;
};

const getRefreshedToken = () => {
  if (!refreshTokenRequest) {
    refreshTokenRequest = fetchNewAccessToken()
      .catch((error) => {
        refreshTokenRequest = null;
        throw error;
      })
      .finally(() => {
        refreshTokenRequest = null;
      });
  }
  return refreshTokenRequest;
};

// Request 인터셉터 (요청 전 처리)
apiClient.interceptors.request.use(
  (config) => {
    // 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 디버깅을 위한 요청 로깅
    console.log('API 요청:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      data: config.data,
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response 인터셉터 (응답 후 처리)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    const isAuthEndpoint =
      originalRequest?.url?.includes(ENDPOINTS.AUTH.LOGIN) ||
      originalRequest?.url?.includes(ENDPOINTS.AUTH.REGISTER) ||
      originalRequest?.url?.includes(ENDPOINTS.AUTH.REFRESH);

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const newToken = await getRefreshedToken();
        if (newToken) {
          apiClient.defaults.headers.Authorization = `Bearer ${newToken}`;
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    if (error.code === 'ERR_NETWORK') {
      console.error('네트워크 연결 오류');
    }

    return Promise.reject(error);
  }
);

export default apiClient;

