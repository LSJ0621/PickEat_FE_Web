/**
 * API Client 설정
 * Axios 인스턴스를 생성하고 인터셉터를 설정합니다.
 */

import { ENDPOINTS } from '@shared/api/endpoints';
import { API_CONFIG, STORAGE_KEYS } from '@shared/utils/constants';
import { logout } from '@app/store/slices/authSlice';
import type { AppStore } from '@app/store';
import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';

// API 기본 URL 설정
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  // Content-Type은 요청 데이터 타입(FormData / JSON)에 따라 axios가 자동 설정하도록 둔다.
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

let refreshTokenRequest: Promise<string | null> | null = null;
let _store: AppStore | null = null;

export const injectStore = (s: AppStore) => {
  _store = s;
};

const handleAuthFailure = () => {
  _store?.dispatch(logout());
  window.location.href = '/login';
};

const fetchNewAccessToken = async () => {
  const expiredToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const response = await refreshClient.post<{ token: string }>(
    ENDPOINTS.AUTH.REFRESH,
    {},
    { headers: expiredToken ? { Authorization: `Bearer ${expiredToken}` } : {} }
  );
  const newToken = response.data.token;
  localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
  return newToken;
};

const getRefreshedToken = () => {
  if (!refreshTokenRequest) {
    refreshTokenRequest = fetchNewAccessToken().finally(() => {
      refreshTokenRequest = null;
    });
  }
  return refreshTokenRequest;
};

// Request 인터셉터 (요청 전 처리)
apiClient.interceptors.request.use(
  (config) => {
    // 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 모든 요청에 Accept-Language 헤더 추가
    const currentLang = localStorage.getItem('i18nextLng') || 'ko';
    config.headers['Accept-Language'] = currentLang;

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
      originalRequest?.url?.includes(ENDPOINTS.AUTH.REFRESH) ||
      originalRequest?.url?.includes(ENDPOINTS.AUTH.PASSWORD_RESET) ||
      originalRequest?.url?.includes(ENDPOINTS.AUTH.PASSWORD_RESET_SEND_CODE) ||
      originalRequest?.url?.includes(ENDPOINTS.AUTH.PASSWORD_RESET_VERIFY_CODE);

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const newToken = await getRefreshedToken();
        if (newToken) {
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        handleAuthFailure();
        return Promise.reject(refreshError);
      }
    } else if (error.response?.status === 401 && !isAuthEndpoint) {
      handleAuthFailure();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
