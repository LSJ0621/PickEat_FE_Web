/**
 * Admin Settings Service 테스트
 * 관리자 설정 관련 API 서비스 함수들을 테스트합니다.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { adminSettingsService } from '@/api/services/admin-settings';
import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@shared/api/endpoints';
import apiClient from '@shared/api/client';
import type { AdminListResponse, PromoteAdminRequest } from '@/types/admin-settings';

const BASE_URL = 'http://localhost:3000';

describe('Admin Settings Service', () => {
  let originalHref: string;

  beforeEach(() => {
    // Store original href
    originalHref = window.location.href;
    // Ensure apiClient has baseURL set for tests
    apiClient.defaults.baseURL = BASE_URL;
    localStorage.clear();
    localStorage.setItem('token', 'valid-admin-token');
    // Clear any Authorization header that might persist from previous tests
    delete apiClient.defaults.headers.Authorization;
    // Reset any handler overrides
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
    // Restore baseURL and window.location in case they were changed by redirect logic
    apiClient.defaults.baseURL = BASE_URL;
    if (window.location.href !== originalHref) {
      window.location.href = originalHref;
    }
  });

  describe('getAdminList', () => {
    it('should get admin list successfully', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.SETTINGS.ADMINS}`, () => {
          return HttpResponse.json([
            {
              id: 1,
              email: 'admin1@example.com',
              name: 'Admin One',
              role: 'ADMIN',
              createdAt: '2024-01-01T00:00:00.000Z',
            },
            {
              id: 2,
              email: 'admin2@example.com',
              name: 'Admin Two',
              role: 'ADMIN',
              createdAt: '2024-01-02T00:00:00.000Z',
            },
          ] as AdminListResponse);
        })
      );

      const result = await adminSettingsService.getAdminList();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('email');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('role');
      expect(result[0].role).toBe('ADMIN');
    });

    it('should handle empty admin list', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.SETTINGS.ADMINS}`, () => {
          return HttpResponse.json([] as AdminListResponse);
        })
      );

      const result = await adminSettingsService.getAdminList();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
    });

    it('should fail without valid token', async () => {
      localStorage.clear();

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.SETTINGS.ADMINS}`, () => {
          return HttpResponse.json(
            { message: '인증이 필요합니다.' },
            { status: 401 }
          );
        })
      );

      await expect(adminSettingsService.getAdminList()).rejects.toThrow();
    });

    it('should fail without admin permission', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.SETTINGS.ADMINS}`, () => {
          return HttpResponse.json(
            { message: '관리자 권한이 필요합니다.' },
            { status: 403 }
          );
        })
      );

      await expect(adminSettingsService.getAdminList()).rejects.toThrow();
    });
  });

  describe('promoteAdmin', () => {
    it('should promote user to admin successfully', async () => {
      const promoteData: PromoteAdminRequest = {
        email: 'user@example.com',
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.ADMIN.SETTINGS.ADMINS}`, async ({ request }) => {
          const body = await request.json() as PromoteAdminRequest;

          if (body.email === 'user@example.com') {
            return HttpResponse.json({
              message: '관리자 권한이 부여되었습니다.',
            });
          }

          return HttpResponse.json(
            { message: '사용자를 찾을 수 없습니다.' },
            { status: 404 }
          );
        })
      );

      const result = await adminSettingsService.promoteAdmin(promoteData);

      expect(result.message).toBe('관리자 권한이 부여되었습니다.');
    });

    it('should fail with non-existent email', async () => {
      const promoteData: PromoteAdminRequest = {
        email: 'nonexistent@example.com',
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.ADMIN.SETTINGS.ADMINS}`, () => {
          return HttpResponse.json(
            { message: '사용자를 찾을 수 없습니다.' },
            { status: 404 }
          );
        })
      );

      await expect(adminSettingsService.promoteAdmin(promoteData)).rejects.toThrow();
    });

    it('should fail with already admin user', async () => {
      const promoteData: PromoteAdminRequest = {
        email: 'admin@example.com',
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.ADMIN.SETTINGS.ADMINS}`, () => {
          return HttpResponse.json(
            { message: '이미 관리자 권한이 있습니다.' },
            { status: 400 }
          );
        })
      );

      await expect(adminSettingsService.promoteAdmin(promoteData)).rejects.toThrow();
    });

    it('should fail with invalid email format', async () => {
      const promoteData: PromoteAdminRequest = {
        email: 'invalid-email',
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.ADMIN.SETTINGS.ADMINS}`, () => {
          return HttpResponse.json(
            { message: '유효하지 않은 이메일 형식입니다.' },
            { status: 400 }
          );
        })
      );

      await expect(adminSettingsService.promoteAdmin(promoteData)).rejects.toThrow();
    });

    it('should fail without admin permission', async () => {
      const promoteData: PromoteAdminRequest = {
        email: 'user@example.com',
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.ADMIN.SETTINGS.ADMINS}`, () => {
          return HttpResponse.json(
            { message: '관리자 권한이 필요합니다.' },
            { status: 403 }
          );
        })
      );

      await expect(adminSettingsService.promoteAdmin(promoteData)).rejects.toThrow();
    });
  });

  describe('demoteAdmin', () => {
    it('should demote admin to user successfully', async () => {
      server.use(
        http.delete(`${BASE_URL}${ENDPOINTS.ADMIN.SETTINGS.ADMIN_DETAIL(2)}`, () => {
          return HttpResponse.json({
            message: '관리자 권한이 해제되었습니다.',
          });
        })
      );

      const result = await adminSettingsService.demoteAdmin(2);

      expect(result.message).toBe('관리자 권한이 해제되었습니다.');
    });

    it('should fail with non-existent admin id', async () => {
      server.use(
        http.delete(`${BASE_URL}${ENDPOINTS.ADMIN.SETTINGS.ADMIN_DETAIL(999)}`, () => {
          return HttpResponse.json(
            { message: '관리자를 찾을 수 없습니다.' },
            { status: 404 }
          );
        })
      );

      await expect(adminSettingsService.demoteAdmin(999)).rejects.toThrow();
    });

    it('should fail when demoting self', async () => {
      server.use(
        http.delete(`${BASE_URL}${ENDPOINTS.ADMIN.SETTINGS.ADMIN_DETAIL(1)}`, () => {
          return HttpResponse.json(
            { message: '자기 자신의 권한은 해제할 수 없습니다.' },
            { status: 400 }
          );
        })
      );

      await expect(adminSettingsService.demoteAdmin(1)).rejects.toThrow();
    });

    it('should fail without admin permission', async () => {
      server.use(
        http.delete(`${BASE_URL}${ENDPOINTS.ADMIN.SETTINGS.ADMIN_DETAIL(2)}`, () => {
          return HttpResponse.json(
            { message: '관리자 권한이 필요합니다.' },
            { status: 403 }
          );
        })
      );

      await expect(adminSettingsService.demoteAdmin(2)).rejects.toThrow();
    });

    it('should fail when trying to demote regular user', async () => {
      server.use(
        http.delete(`${BASE_URL}${ENDPOINTS.ADMIN.SETTINGS.ADMIN_DETAIL(10)}`, () => {
          return HttpResponse.json(
            { message: '관리자가 아닌 사용자입니다.' },
            { status: 400 }
          );
        })
      );

      await expect(adminSettingsService.demoteAdmin(10)).rejects.toThrow();
    });
  });
});
