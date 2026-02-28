/**
 * 인증 관련 타입 정의
 */

import type { Language } from '@shared/types/common';
import type { AnalysisParagraphs } from '@features/user/types';

// AuthResponse는 shared layer에서 관리 (shared/api/client.ts가 의존)
export type { AuthResponse } from '@shared/types/auth';

export interface User {
  email: string;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  preferences?: {
    likes: string[];
    dislikes: string[];
    analysis?: string | null;
    analysisParagraphs?: AnalysisParagraphs | null;
  } | null;
  preferredLanguage: Language;
  role?: string;
  createdAt?: string;
  birthDate?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string; // 필수 필드 (백엔드 RegisterDto와 동기화)
}

export type EmailVerificationPurpose = 'SIGNUP' | 'RESET_PASSWORD' | 'RE_REGISTER';

export interface KakaoLoginResponse {
  token: string;
  email?: string | null;
  name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  preferences?: {
    likes: string[];
    dislikes: string[];
    analysis?: string | null;
    analysisParagraphs?: AnalysisParagraphs | null;
  } | null;
}

export interface LoginResponse {
  token: string;
  email?: string | null;
  name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  preferences?: {
    likes: string[];
    dislikes: string[];
    analysis?: string | null;
    analysisParagraphs?: AnalysisParagraphs | null;
  } | null;
}

export interface UpdateUserRequest {
  name?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface UpdateUserResponse {
  name: string | null;
  birthDate?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
}

export interface RegisterResponse {
  message: string;
}

export interface PasswordResetSendResponse {
  message: string;
  retryAfter?: number;
  remainCount?: number;
}

export interface PasswordResetVerifyResponse {
  success: boolean;
  message?: string;
}

export interface PasswordResetRequest {
  email: string;
  newPassword: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

export interface CheckEmailResponse {
  available: boolean;
  message?: string;
  errorCode?: string;
  canReRegister?: boolean;
}

export interface EmailVerificationResponse {
  success: boolean;
  message?: string;
  messageCode?: string;
  remainCount?: number;
}

export interface ReRegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface ReRegisterResponse {
  message: string;
}

export interface ReRegisterSocialRequest {
  email: string;
}

export interface ReRegisterSocialResponse {
  message: string;
}
