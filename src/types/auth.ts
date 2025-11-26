/**
 * 인증 관련 타입 정의
 */

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string; // 선택 필드
}

export type EmailVerificationPurpose = 'SIGNUP' | 'RESET_PASSWORD';

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface KakaoLoginResponse {
  id: number;
  token: string;
  email?: string | null;
  name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface LoginResponse {
  id: number;
  token: string;
  email?: string | null;
  name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface UpdateUserRequest {
  name?: string;
  profileImage?: string;
}

export interface UpdateUserResponse {
  id: number;
  name: string | null;
  profileImage: string | null;
}

export interface RegisterResponse {
  message: string;
}

export interface CheckEmailResponse {
  available: boolean;
  message: string;
}

export interface EmailVerificationResponse {
  success: boolean;
  message?: string;
}
