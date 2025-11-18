/**
 * 인증 관련 API 서비스
 * 도메인별로 API 함수를 분리하여 관리합니다.
 */

import type { AuthResponse, CheckEmailResponse, KakaoLoginResponse, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UpdateUserRequest, UpdateUserResponse, User } from '../../types/auth';
import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export const authService = {
  // 이메일 중복 확인
  checkEmail: async (email: string): Promise<CheckEmailResponse> => {
    const response = await apiClient.get<CheckEmailResponse>(
      ENDPOINTS.AUTH.CHECK_EMAIL,
      { params: { email } }
    );
    return response.data;
  },

  // 로그인
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },

  // 회원가입
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>(ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  // 카카오 로그인 (OAuth 코드 방식)
  kakaoLogin: async (code: string): Promise<KakaoLoginResponse> => {
    console.log('카카오 로그인 요청:', {
      endpoint: ENDPOINTS.AUTH.KAKAO_LOGIN,
      code: code.substring(0, 10) + '...', // 코드 일부만 로깅
    });
    
    const response = await apiClient.post<KakaoLoginResponse>(
      ENDPOINTS.AUTH.KAKAO_LOGIN,
      { code }
    );
    return response.data;
  },

  // 구글 로그인 (OAuth 코드 방식)
  googleLogin: async (code: string): Promise<KakaoLoginResponse> => {
    console.log('구글 로그인 요청:', {
      endpoint: ENDPOINTS.AUTH.GOOGLE_LOGIN,
      code: code.substring(0, 10) + '...', // 코드 일부만 로깅
    });
    
    const response = await apiClient.post<KakaoLoginResponse>(
      ENDPOINTS.AUTH.GOOGLE_LOGIN,
      { code }
    );
    return response.data;
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  },

  // 현재 사용자 정보 조회
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>(ENDPOINTS.AUTH.ME);
    return response.data;
  },

  // 토큰 갱신
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.REFRESH);
    return response.data;
  },

  // 유저 정보 업데이트 (이름, 프로필 이미지)
  updateUser: async (data: UpdateUserRequest): Promise<UpdateUserResponse> => {
    const response = await apiClient.patch<UpdateUserResponse>(
      ENDPOINTS.USER.UPDATE,
      data
    );
    return response.data;
  },
};

