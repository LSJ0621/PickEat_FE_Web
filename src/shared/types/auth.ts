/**
 * 인증 공통 타입 정의 (shared layer)
 * shared/api/client.ts 에서 AuthResponse를 사용하기 위해 이 위치에 정의합니다.
 */

import type { Language } from '@shared/types/common';

export interface SharedUser {
  email: string;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  preferences?: {
    likes: string[];
    dislikes: string[];
    analysis?: string | null;
    analysisParagraphs?: {
      paragraph1: string;
      paragraph2: string;
      paragraph3: string;
    } | null;
  } | null;
  preferredLanguage: Language;
  role?: string;
  createdAt?: string;
  birthDate?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
}

export interface AuthResponse {
  token: string;
  user: SharedUser;
}
