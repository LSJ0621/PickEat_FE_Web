/**
 * Admin Service 테스트
 * 관리자 대시보드 및 관리 API 서비스 함수들을 테스트합니다.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { adminService } from '@/api/services/admin';
import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@/api/endpoints';
import apiClient from '@/api/client';
import type {
  DashboardSummary,
  RecentActivities,
  TrendData,
  AdminUserListQuery,
  AdminUserPlaceListQuery,
  UpdateUserPlaceByAdminRequest,
} from '@/types/admin';

const BASE_URL = 'http://localhost:3000';

describe('Admin Service', () => {
  beforeEach(() => {
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
  });

  describe('getDashboardSummary', () => {
    it('should get dashboard summary successfully', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.DASHBOARD.SUMMARY}`, () => {
          return HttpResponse.json({
            totalUsers: 150,
            activeUsers: 120,
            totalPlaces: 50,
            pendingPlaces: 5,
            totalRecommendations: 1000,
          } as DashboardSummary);
        })
      );

      const result = await adminService.getDashboardSummary();

      expect(result).toHaveProperty('totalUsers');
      expect(result).toHaveProperty('activeUsers');
      expect(result).toHaveProperty('totalPlaces');
      expect(result).toHaveProperty('pendingPlaces');
      expect(result).toHaveProperty('totalRecommendations');
      expect(result.totalUsers).toBe(150);
      expect(result.activeUsers).toBe(120);
    });

    it('should fail without admin permission', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.DASHBOARD.SUMMARY}`, () => {
          return HttpResponse.json(
            { message: '관리자 권한이 필요합니다.' },
            { status: 403 }
          );
        })
      );

      await expect(adminService.getDashboardSummary()).rejects.toThrow();
    });
  });

  describe('getRecentActivities', () => {
    it('should get recent activities successfully', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.DASHBOARD.RECENT_ACTIVITIES}`, () => {
          return HttpResponse.json({
            recentRegistrations: [
              {
                id: 1,
                email: 'user1@example.com',
                name: 'User One',
                registeredAt: '2024-01-15T10:00:00.000Z',
              },
            ],
            recentPlaces: [
              {
                id: 1,
                name: '테스트 가게',
                submittedBy: 'user1@example.com',
                status: 'PENDING',
                submittedAt: '2024-01-15T11:00:00.000Z',
              },
            ],
          } as RecentActivities);
        })
      );

      const result = await adminService.getRecentActivities();

      expect(result).toHaveProperty('recentRegistrations');
      expect(result).toHaveProperty('recentPlaces');
      expect(result.recentRegistrations).toBeInstanceOf(Array);
      expect(result.recentPlaces).toBeInstanceOf(Array);
    });

    it('should fail without admin permission', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.DASHBOARD.RECENT_ACTIVITIES}`, () => {
          return HttpResponse.json(
            { message: '관리자 권한이 필요합니다.' },
            { status: 403 }
          );
        })
      );

      await expect(adminService.getRecentActivities()).rejects.toThrow();
    });
  });

  describe('getTrends', () => {
    it('should get trends with default parameters', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.DASHBOARD.TRENDS}`, ({ request }) => {
          const url = new URL(request.url);
          const period = url.searchParams.get('period');
          const type = url.searchParams.get('type');

          expect(period).toBe('7d');
          expect(type).toBe('all');

          return HttpResponse.json({
            period: '7d',
            type: 'all',
            data: [
              { date: '2024-01-10', users: 10, places: 2, recommendations: 50 },
              { date: '2024-01-11', users: 12, places: 3, recommendations: 55 },
            ],
          } as TrendData);
        })
      );

      const result = await adminService.getTrends();

      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('data');
      expect(result.data).toBeInstanceOf(Array);
      expect(result.period).toBe('7d');
      expect(result.type).toBe('all');
    });

    it('should get trends with custom parameters', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.DASHBOARD.TRENDS}`, ({ request }) => {
          const url = new URL(request.url);
          const period = url.searchParams.get('period');
          const type = url.searchParams.get('type');

          expect(period).toBe('30d');
          expect(type).toBe('users');

          return HttpResponse.json({
            period: '30d',
            type: 'users',
            data: [
              { date: '2024-01-01', users: 100 },
              { date: '2024-01-02', users: 105 },
            ],
          } as TrendData);
        })
      );

      const result = await adminService.getTrends('30d', 'users');

      expect(result.period).toBe('30d');
      expect(result.type).toBe('users');
      expect(result.data).toBeInstanceOf(Array);
    });

    it('should fail without admin permission', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.DASHBOARD.TRENDS}`, () => {
          return HttpResponse.json(
            { message: '관리자 권한이 필요합니다.' },
            { status: 403 }
          );
        })
      );

      await expect(adminService.getTrends()).rejects.toThrow();
    });
  });

  describe('getUsers', () => {
    it('should get users with pagination', async () => {
      const query: AdminUserListQuery = {
        page: 1,
        limit: 20,
      };

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.USERS}`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('page')).toBe('1');
          expect(url.searchParams.get('limit')).toBe('20');

          return HttpResponse.json({
            users: [
              { id: 1, email: 'user1@example.com', name: 'User One', role: 'USER', isActive: true },
              { id: 2, email: 'user2@example.com', name: 'User Two', role: 'USER', isActive: true },
            ],
            pageInfo: { page: 1, limit: 20, totalCount: 50, hasNext: true },
          });
        })
      );

      const result = await adminService.getUsers(query);

      expect(result.users).toBeInstanceOf(Array);
      expect(result.pageInfo).toBeDefined();
      expect(result.pageInfo.page).toBe(1);
      expect(result.pageInfo.limit).toBe(20);
    });

    it('should get users with search query', async () => {
      const query: AdminUserListQuery = {
        page: 1,
        limit: 20,
        search: 'test',
      };

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.USERS}`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('search')).toBe('test');

          return HttpResponse.json({
            users: [{ id: 1, email: 'test@example.com', name: 'Test User', role: 'USER', isActive: true }],
            pageInfo: { page: 1, limit: 20, totalCount: 1, hasNext: false },
          });
        })
      );

      const result = await adminService.getUsers(query);

      expect(result.users.length).toBe(1);
      expect(result.users[0].email).toContain('test');
    });

    it('should fail without admin permission', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.USERS}`, () => {
          return HttpResponse.json(
            { message: '관리자 권한이 필요합니다.' },
            { status: 403 }
          );
        })
      );

      await expect(adminService.getUsers({ page: 1, limit: 20 })).rejects.toThrow();
    });
  });

  describe('getUserDetail', () => {
    it('should get user detail successfully', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.USER_DETAIL(1)}`, () => {
          return HttpResponse.json({
            id: 1,
            email: 'user@example.com',
            name: 'Test User',
            role: 'USER',
            isActive: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            preferences: { likes: ['한식'], dislikes: [] },
          });
        })
      );

      const result = await adminService.getUserDetail(1);

      expect(result.id).toBe(1);
      expect(result.email).toBe('user@example.com');
      expect(result).toHaveProperty('preferences');
    });

    it('should fail with non-existent user id', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.USER_DETAIL(999)}`, () => {
          return HttpResponse.json(
            { message: '사용자를 찾을 수 없습니다.' },
            { status: 404 }
          );
        })
      );

      await expect(adminService.getUserDetail(999)).rejects.toThrow();
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user successfully', async () => {
      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.ADMIN.USER_DEACTIVATE(1)}`, () => {
          return HttpResponse.json({
            success: true,
            message: '사용자가 비활성화되었습니다.',
          });
        })
      );

      const result = await adminService.deactivateUser(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('사용자가 비활성화되었습니다.');
    });

    it('should fail with non-existent user id', async () => {
      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.ADMIN.USER_DEACTIVATE(999)}`, () => {
          return HttpResponse.json(
            { message: '사용자를 찾을 수 없습니다.' },
            { status: 404 }
          );
        })
      );

      await expect(adminService.deactivateUser(999)).rejects.toThrow();
    });
  });

  describe('activateUser', () => {
    it('should activate user successfully', async () => {
      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.ADMIN.USER_ACTIVATE(1)}`, () => {
          return HttpResponse.json({
            success: true,
            message: '사용자가 활성화되었습니다.',
          });
        })
      );

      const result = await adminService.activateUser(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('사용자가 활성화되었습니다.');
    });

    it('should fail with non-existent user id', async () => {
      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.ADMIN.USER_ACTIVATE(999)}`, () => {
          return HttpResponse.json(
            { message: '사용자를 찾을 수 없습니다.' },
            { status: 404 }
          );
        })
      );

      await expect(adminService.activateUser(999)).rejects.toThrow();
    });
  });

  describe('getUserPlaces', () => {
    it('should get user places with pagination', async () => {
      const query: AdminUserPlaceListQuery = {
        page: 1,
        limit: 20,
      };

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.USER_PLACES}`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('page')).toBe('1');
          expect(url.searchParams.get('limit')).toBe('20');

          return HttpResponse.json({
            items: [
              {
                id: 1,
                name: '테스트 가게',
                status: 'PENDING',
                submittedBy: { id: 1, email: 'user@example.com', name: 'Test User' },
                createdAt: '2024-01-15T00:00:00.000Z',
              },
            ],
            pageInfo: { page: 1, limit: 20, totalCount: 1, hasNext: false },
          });
        })
      );

      const result = await adminService.getUserPlaces(query);

      expect(result.items).toBeInstanceOf(Array);
      expect(result.pageInfo).toBeDefined();
    });

    it('should get user places with status filter', async () => {
      const query: AdminUserPlaceListQuery = {
        page: 1,
        limit: 20,
        status: 'PENDING',
      };

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.USER_PLACES}`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('status')).toBe('PENDING');

          return HttpResponse.json({
            items: [
              {
                id: 1,
                name: '대기중 가게',
                status: 'PENDING',
                submittedBy: { id: 1, email: 'user@example.com', name: 'Test User' },
                createdAt: '2024-01-15T00:00:00.000Z',
              },
            ],
            pageInfo: { page: 1, limit: 20, totalCount: 1, hasNext: false },
          });
        })
      );

      const result = await adminService.getUserPlaces(query);

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0].status).toBe('PENDING');
    });
  });

  describe('getUserPlaceDetail', () => {
    it('should get user place detail successfully', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.USER_PLACE_DETAIL(1)}`, () => {
          return HttpResponse.json({
            id: 1,
            name: '테스트 가게',
            address: '서울시 강남구',
            latitude: 37.5172,
            longitude: 127.0473,
            status: 'PENDING',
            submittedBy: { id: 1, email: 'user@example.com', name: 'Test User' },
            category: '한식',
            menuTypes: ['한식'],
            photos: [],
            createdAt: '2024-01-15T00:00:00.000Z',
          });
        })
      );

      const result = await adminService.getUserPlaceDetail(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('테스트 가게');
      expect(result.status).toBe('PENDING');
    });

    it('should fail with non-existent place id', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.USER_PLACE_DETAIL(999)}`, () => {
          return HttpResponse.json(
            { message: '가게를 찾을 수 없습니다.' },
            { status: 404 }
          );
        })
      );

      await expect(adminService.getUserPlaceDetail(999)).rejects.toThrow();
    });
  });

  describe('approveUserPlace', () => {
    it('should approve user place successfully', async () => {
      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.ADMIN.USER_PLACE_APPROVE(1)}`, () => {
          return HttpResponse.json({
            id: 1,
            status: 'APPROVED',
          });
        })
      );

      const result = await adminService.approveUserPlace(1);

      expect(result.id).toBe(1);
      expect(result.status).toBe('APPROVED');
    });

    it('should fail with non-existent place id', async () => {
      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.ADMIN.USER_PLACE_APPROVE(999)}`, () => {
          return HttpResponse.json(
            { message: '가게를 찾을 수 없습니다.' },
            { status: 404 }
          );
        })
      );

      await expect(adminService.approveUserPlace(999)).rejects.toThrow();
    });
  });

  describe('rejectUserPlace', () => {
    it('should reject user place successfully', async () => {
      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.ADMIN.USER_PLACE_REJECT(1)}`, async ({ request }) => {
          const body = await request.json() as { reason: string };
          expect(body.reason).toBe('정보 부족');

          return HttpResponse.json({
            id: 1,
            status: 'REJECTED',
          });
        })
      );

      const result = await adminService.rejectUserPlace(1, '정보 부족');

      expect(result.id).toBe(1);
      expect(result.status).toBe('REJECTED');
    });

    it('should fail without reason', async () => {
      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.ADMIN.USER_PLACE_REJECT(1)}`, () => {
          return HttpResponse.json(
            { message: '거부 사유가 필요합니다.' },
            { status: 400 }
          );
        })
      );

      await expect(adminService.rejectUserPlace(1, '')).rejects.toThrow();
    });
  });

  describe('updateUserPlace', () => {
    it('should update user place successfully with basic data', async () => {
      const updateData: UpdateUserPlaceByAdminRequest = {
        version: 1,
        name: '수정된 가게명',
        address: '서울시 강남구 수정된 주소',
      };

      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.ADMIN.USER_PLACE_UPDATE(1)}`, async ({ request }) => {
          const formData = await request.formData();
          expect(formData.get('version')).toBe('1');
          expect(formData.get('name')).toBe('수정된 가게명');
          expect(formData.get('address')).toBe('서울시 강남구 수정된 주소');

          return HttpResponse.json({
            id: 1,
            name: '수정된 가게명',
            address: '서울시 강남구 수정된 주소',
            latitude: 37.5172,
            longitude: 127.0473,
            status: 'PENDING',
            version: 2,
            submittedBy: { id: 1, email: 'user@example.com', name: 'Test User' },
            category: '한식',
            menuTypes: ['한식'],
            photos: [],
            createdAt: '2024-01-15T00:00:00.000Z',
          });
        })
      );

      const result = await adminService.updateUserPlace(1, updateData);

      expect(result.id).toBe(1);
      expect(result.name).toBe('수정된 가게명');
      expect(result.version).toBe(2);
    });

    it('should update user place with menuTypes', async () => {
      const updateData: UpdateUserPlaceByAdminRequest = {
        version: 1,
        menuTypes: ['한식', '일식'],
      };

      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.ADMIN.USER_PLACE_UPDATE(1)}`, async ({ request }) => {
          const formData = await request.formData();
          const menuTypes = formData.getAll('menuTypes');
          expect(menuTypes).toEqual(['한식', '일식']);

          return HttpResponse.json({
            id: 1,
            name: '테스트 가게',
            address: '서울시 강남구',
            latitude: 37.5172,
            longitude: 127.0473,
            status: 'PENDING',
            version: 2,
            submittedBy: { id: 1, email: 'user@example.com', name: 'Test User' },
            category: '한식',
            menuTypes: ['한식', '일식'],
            photos: [],
            createdAt: '2024-01-15T00:00:00.000Z',
          });
        })
      );

      const result = await adminService.updateUserPlace(1, updateData);

      expect(result.menuTypes).toEqual(['한식', '일식']);
    });

    it('should fail with version conflict', async () => {
      const updateData: UpdateUserPlaceByAdminRequest = {
        version: 1,
        name: '수정된 가게명',
      };

      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.ADMIN.USER_PLACE_UPDATE(1)}`, () => {
          return HttpResponse.json(
            { message: '버전 충돌이 발생했습니다.' },
            { status: 409 }
          );
        })
      );

      await expect(adminService.updateUserPlace(1, updateData)).rejects.toThrow();
    });
  });
});
