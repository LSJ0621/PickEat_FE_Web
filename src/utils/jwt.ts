/**
 * JWT 토큰 디코딩 유틸리티
 */

import { STORAGE_KEYS } from './constants';

interface JwtPayload {
  email: string;
  role: string;
  exp: number; // Expiration time
  iat: number; // Issued at
}

/**
 * JWT 토큰을 디코딩하여 payload 반환
 * @param token - JWT 토큰 문자열
 * @returns 디코딩된 payload 또는 null
 */
export const decodeJwt = (token: string | null): JwtPayload | null => {
  if (!token) {
    return null;
  }

  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * localStorage의 토큰에서 role 추출
 * @returns role 문자열 또는 null
 */
export const getUserRoleFromToken = (): string | null => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!token) {
    return null;
  }

  const decoded = decodeJwt(token);
  return decoded?.role || null;
};

