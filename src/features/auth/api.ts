/**
 * 인증 관련 API 서비스
 * 도메인별로 API 함수를 분리하여 관리합니다.
 */

import apiClient from '@shared/api/client';
import { ENDPOINTS } from '@shared/api/endpoints';
import type { AuthResponse } from '@shared/types/auth';
import type {
    CheckEmailResponse,
    EmailVerificationPurpose,
    EmailVerificationResponse,
    KakaoLoginResponse,
    LoginRequest,
    LoginResponse,
    PasswordResetRequest,
    PasswordResetResponse,
    PasswordResetSendResponse,
    PasswordResetVerifyResponse,
    RegisterRequest,
    RegisterResponse,
    ReRegisterRequest,
    ReRegisterResponse,
    ReRegisterSocialRequest,
    ReRegisterSocialResponse,
    UpdateUserRequest,
    UpdateUserResponse,
    User,
} from '@features/auth/types';

export const authService = {
  // 이메일 중복 확인
  checkEmail: async (email: string): Promise<CheckEmailResponse> => {
    const response = await apiClient.get<CheckEmailResponse>(
      ENDPOINTS.AUTH.CHECK_EMAIL,
      { params: { email } }
    );
    return response.data;
  },

  // 이메일 인증 코드 발송
  sendEmailVerificationCode: async (
    email: string,
    purpose: EmailVerificationPurpose = 'SIGNUP'
  ): Promise<EmailVerificationResponse> => {
    const response = await apiClient.post<EmailVerificationResponse>(
      ENDPOINTS.AUTH.EMAIL_SEND_CODE,
      { email, purpose }
    );
    return response.data;
  },

  // 이메일 인증 코드 검증
  verifyEmailCode: async (
    email: string,
    code: string,
    purpose: EmailVerificationPurpose = 'SIGNUP'
  ): Promise<EmailVerificationResponse> => {
    const response = await apiClient.post<EmailVerificationResponse>(
      ENDPOINTS.AUTH.EMAIL_VERIFY_CODE,
      { email, code, purpose }
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
    const response = await apiClient.post<KakaoLoginResponse>(
      ENDPOINTS.AUTH.KAKAO_LOGIN,
      { code }
    );
    return response.data;
  },

  // 구글 로그인 (OAuth 코드 방식)
  googleLogin: async (code: string): Promise<KakaoLoginResponse> => {
    const response = await apiClient.post<KakaoLoginResponse>(
      ENDPOINTS.AUTH.GOOGLE_LOGIN,
      { code }
    );
    return response.data;
  },

  // 비밀번호 재설정 - 인증 코드 발송
  sendPasswordResetCode: async (email: string): Promise<PasswordResetSendResponse> => {
    const response = await apiClient.post<PasswordResetSendResponse>(
      ENDPOINTS.AUTH.PASSWORD_RESET_SEND_CODE,
      { email }
    );
    return response.data;
  },

  // 비밀번호 재설정 - 인증 코드 검증
  verifyPasswordResetCode: async (email: string, code: string): Promise<PasswordResetVerifyResponse> => {
    const response = await apiClient.post<PasswordResetVerifyResponse>(
      ENDPOINTS.AUTH.PASSWORD_RESET_VERIFY_CODE,
      { email, code }
    );
    return response.data;
  },

  // 비밀번호 재설정
  resetPassword: async (data: PasswordResetRequest): Promise<PasswordResetResponse> => {
    const response = await apiClient.post<PasswordResetResponse>(
      ENDPOINTS.AUTH.PASSWORD_RESET,
      data
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

  // 재가입
  reRegister: async (data: ReRegisterRequest): Promise<ReRegisterResponse> => {
    const response = await apiClient.post<ReRegisterResponse>(
      ENDPOINTS.AUTH.RE_REGISTER,
      data
    );
    return response.data;
  },

  // 소셜 재가입
  reRegisterSocial: async (data: ReRegisterSocialRequest): Promise<ReRegisterSocialResponse> => {
    const response = await apiClient.post<ReRegisterSocialResponse>(
      ENDPOINTS.AUTH.RE_REGISTER_SOCIAL,
      data
    );
    return response.data;
  },
};
