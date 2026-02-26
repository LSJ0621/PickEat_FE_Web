/**
 * Auth Service 테스트
 * 인증 관련 API 서비스 함수들을 테스트합니다.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { authService } from '@features/auth/api';
import { server } from '@tests/mocks/server';
import type { LoginRequest, RegisterRequest } from '@shared/types/auth';
import { apiClient } from '@shared/api/client';
import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@shared/api/endpoints';

const BASE_URL = 'http://localhost:3000';

describe('Auth Service', () => {
  beforeEach(() => {
    // Ensure apiClient has baseURL set for tests
    // This is needed because import.meta.env may not be available at module load time
    apiClient.defaults.baseURL = BASE_URL;
    localStorage.clear();
    // Clear any Authorization header that might persist from previous tests
    delete apiClient.defaults.headers.Authorization;
    // Reset any handler overrides
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('checkEmail', () => {
    it('should return available: true for new email', async () => {
      const result = await authService.checkEmail('new@example.com');

      expect(result.available).toBe(true);
      expect(result.message).toBe('사용 가능한 이메일입니다.');
    });

    it('should return available: false for existing email', async () => {
      const result = await authService.checkEmail('existing@example.com');

      expect(result.available).toBe(false);
      expect(result.message).toBe('이미 등록된 이메일입니다.');
    });

    it('should return canReRegister: true for deleted account', async () => {
      const result = await authService.checkEmail('deleted@example.com');

      expect(result.available).toBe(false);
      expect(result.message).toBe('탈퇴한 계정입니다.');
      expect(result.canReRegister).toBe(true);
    });
  });

  describe('sendEmailVerificationCode', () => {
    it('should send verification code successfully', async () => {
      const result = await authService.sendEmailVerificationCode('test@example.com', 'SIGNUP');

      expect(result.success).toBe(true);
      expect(result.message).toBe('인증 코드가 발송되었습니다.');
    });

    it('should handle invalid email', async () => {
      await expect(
        authService.sendEmailVerificationCode('invalid@example.com', 'SIGNUP')
      ).rejects.toThrow();
    });

    it('should use default purpose SIGNUP when not provided', async () => {
      const result = await authService.sendEmailVerificationCode('test@example.com');

      expect(result.success).toBe(true);
    });
  });

  describe('verifyEmailCode', () => {
    it('should verify code successfully with correct code', async () => {
      const result = await authService.verifyEmailCode('test@example.com', '123456', 'SIGNUP');

      expect(result.success).toBe(true);
      expect(result.message).toBe('이메일 인증이 완료되었습니다.');
    });

    it('should fail with incorrect code', async () => {
      await expect(
        authService.verifyEmailCode('test@example.com', 'wrong-code', 'SIGNUP')
      ).rejects.toThrow();
    });

    it('should use default purpose SIGNUP when not provided', async () => {
      const result = await authService.verifyEmailCode('test@example.com', '123456');

      expect(result.success).toBe(true);
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.login(loginData);

      expect(result.token).toBe('mock-jwt-token');
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
    });

    it('should fail with incorrect credentials', async () => {
      const loginData: LoginRequest = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(loginData)).rejects.toThrow();
    });

    it('should return canReRegister for deleted account', async () => {
      const loginData: LoginRequest = {
        email: 'deleted@example.com',
        password: 'password123',
      };

      await expect(authService.login(loginData)).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should register successfully with valid data', async () => {
      const registerData: RegisterRequest = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      const result = await authService.register(registerData);

      expect(result.message).toBe('회원가입이 완료되었습니다.');
    });

    it('should fail with existing email', async () => {
      const registerData: RegisterRequest = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      await expect(authService.register(registerData)).rejects.toThrow();
    });
  });

  describe('kakaoLogin', () => {
    it('should login successfully with valid kakao code', async () => {
      const result = await authService.kakaoLogin('valid-kakao-code');

      expect(result.token).toBe('mock-jwt-token');
      expect(result.email).toBeDefined();
    });

    it('should fail with invalid kakao code', async () => {
      await expect(authService.kakaoLogin('invalid-code')).rejects.toThrow();
    });
  });

  describe('googleLogin', () => {
    it('should login successfully with valid google code', async () => {
      const result = await authService.googleLogin('valid-google-code');

      expect(result.token).toBe('mock-jwt-token');
      expect(result.email).toBeDefined();
    });

    it('should fail with invalid google code', async () => {
      await expect(authService.googleLogin('invalid-code')).rejects.toThrow();
    });
  });

  describe('sendPasswordResetCode', () => {
    it('should send password reset code successfully', async () => {
      const result = await authService.sendPasswordResetCode('test@example.com');

      expect(result.message).toBe('비밀번호 재설정 코드가 발송되었습니다.');
      expect(result.retryAfter).toBeDefined();
      expect(result.remainCount).toBeDefined();
    });

    it('should fail with non-existing email', async () => {
      await expect(
        authService.sendPasswordResetCode('notfound@example.com')
      ).rejects.toThrow();
    });
  });

  describe('verifyPasswordResetCode', () => {
    it('should verify password reset code successfully', async () => {
      const result = await authService.verifyPasswordResetCode('test@example.com', '123456');

      expect(result.success).toBe(true);
      expect(result.message).toBe('코드 인증이 완료되었습니다.');
    });

    it('should fail with incorrect code', async () => {
      await expect(
        authService.verifyPasswordResetCode('test@example.com', 'wrong-code')
      ).rejects.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const result = await authService.resetPassword({
        email: 'test@example.com',
        newPassword: 'newpassword123',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('비밀번호가 재설정되었습니다.');
    });

    it('should fail with short password', async () => {
      await expect(
        authService.resetPassword({
          email: 'test@example.com',
          newPassword: 'short',
        })
      ).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      await expect(authService.logout()).resolves.not.toThrow();
    });
  });

  describe('getMe', () => {
    it('should get current user with valid token', async () => {
      localStorage.setItem('token', 'valid-token');

      const result = await authService.getMe();

      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
      expect(result.role).toBe('USER');
    });

    it('should fail without token', async () => {
      const originalHref = window.location.href;

      // Override the default refresh handler to fail when there's no valid session
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, () => {
          return HttpResponse.json(
            { message: '유효하지 않은 토큰입니다.' },
            { status: 401 }
          );
        })
      );

      await expect(authService.getMe()).rejects.toThrow();

      // Restore original href in case interceptor modified it
      window.location.href = originalHref;
      // Ensure baseURL is still set correctly for next tests
      apiClient.defaults.baseURL = BASE_URL;
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully with valid refresh token', async () => {
      const result = await authService.refreshToken();

      expect(result).toBeDefined();
      expect(result.token).toBe('new-access-token');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      localStorage.setItem('token', 'valid-token');

      const result = await authService.updateUser({
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
    });
  });

  describe('reRegister', () => {
    it('should re-register deleted account successfully', async () => {
      const result = await authService.reRegister({
        email: 'deleted@example.com',
        password: 'newpassword123',
        name: 'Re-registered User',
      });

      expect(result.message).toBe('재가입이 완료되었습니다.');
    });

    it('should fail re-register for non-deleted account', async () => {
      await expect(
        authService.reRegister({
          email: 'active@example.com',
          password: 'password123',
          name: 'User',
        })
      ).rejects.toThrow();
    });
  });

  describe('reRegisterSocial', () => {
    it('should re-register social account successfully', async () => {
      const result = await authService.reRegisterSocial({
        email: 'deleted@example.com',
      });

      expect(result.message).toBe('재가입이 완료되었습니다.');
    });

    it('should fail re-register social with non-deleted account', async () => {
      await expect(
        authService.reRegisterSocial({
          email: 'active@example.com',
        })
      ).rejects.toThrow();
    });
  });
});
