/**
 * User Place Service 테스트
 * 사용자 가게 등록 관련 API 서비스 함수들을 테스트합니다.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userPlaceService } from '@/api/services/user-place';
import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@shared/api/endpoints';
import apiClient from '@shared/api/client';
import type {
  CheckRegistrationRequest,
  CreateUserPlaceRequest,
  UpdateUserPlaceRequest,
  UserPlaceListQuery,
  UserPlace,
} from '@/types/user-place';

const BASE_URL = 'http://localhost:3000';

describe('User Place Service', () => {
  let originalHref: string;

  beforeEach(() => {
    // Store original href
    originalHref = window.location.href;
    // Ensure apiClient has baseURL set for tests
    apiClient.defaults.baseURL = BASE_URL;
    localStorage.clear();
    localStorage.setItem('token', 'valid-token');
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

  describe('checkRegistration', () => {
    it('should return can register when place is new', async () => {
      const checkData: CheckRegistrationRequest = {
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.USER_PLACE.CHECK}`, async ({ request }) => {
          const body = await request.json() as CheckRegistrationRequest;
          expect(body.placeId).toBe('ChIJN1t_tDeuEmsRUsoyG83frY4');

          return HttpResponse.json({
            canRegister: true,
            message: '등록 가능한 가게입니다.',
          });
        })
      );

      const result = await userPlaceService.checkRegistration(checkData);

      expect(result.canRegister).toBe(true);
      expect(result.message).toBe('등록 가능한 가게입니다.');
    });

    it('should return cannot register when place already exists', async () => {
      const checkData: CheckRegistrationRequest = {
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.USER_PLACE.CHECK}`, () => {
          return HttpResponse.json({
            canRegister: false,
            message: '이미 등록된 가게입니다.',
            existingPlaceId: 123,
          });
        })
      );

      const result = await userPlaceService.checkRegistration(checkData);

      expect(result.canRegister).toBe(false);
      expect(result.message).toBe('이미 등록된 가게입니다.');
      expect(result.existingPlaceId).toBe(123);
    });

    it('should fail with missing placeId', async () => {
      const checkData = {} as CheckRegistrationRequest;

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.USER_PLACE.CHECK}`, () => {
          return HttpResponse.json(
            { message: 'placeId는 필수입니다.' },
            { status: 400 }
          );
        })
      );

      await expect(userPlaceService.checkRegistration(checkData)).rejects.toThrow();
    });

    it('should fail without authentication', async () => {
      localStorage.clear();

      const checkData: CheckRegistrationRequest = {
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.USER_PLACE.CHECK}`, () => {
          return HttpResponse.json(
            { message: '인증이 필요합니다.' },
            { status: 401 }
          );
        })
      );

      await expect(userPlaceService.checkRegistration(checkData)).rejects.toThrow();
    });
  });

  describe('createUserPlace', () => {
    it('should create user place successfully with required fields', async () => {
      const createData: CreateUserPlaceRequest = {
        name: '테스트 레스토랑',
        address: '서울시 강남구 테헤란로 123',
        latitude: 37.5172,
        longitude: 127.0473,
        menuTypes: ['한식'],
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.USER_PLACE.CREATE}`, async ({ request }) => {
          const formData = await request.formData();
          expect(formData.get('name')).toBe('테스트 레스토랑');
          expect(formData.get('address')).toBe('서울시 강남구 테헤란로 123');
          expect(formData.get('latitude')).toBe('37.5172');
          expect(formData.get('longitude')).toBe('127.0473');

          return HttpResponse.json({
            id: 1,
            name: '테스트 레스토랑',
            address: '서울시 강남구 테헤란로 123',
            latitude: 37.5172,
            longitude: 127.0473,
            menuTypes: ['한식'],
            status: 'PENDING',
            version: 1,
            photos: [],
            createdAt: '2024-01-15T00:00:00.000Z',
            updatedAt: '2024-01-15T00:00:00.000Z',
          } as UserPlace);
        })
      );

      const result = await userPlaceService.createUserPlace(createData);

      expect(result.id).toBe(1);
      expect(result.name).toBe('테스트 레스토랑');
      expect(result.status).toBe('PENDING');
    });

    it('should create user place with optional fields', async () => {
      const createData: CreateUserPlaceRequest = {
        name: '테스트 레스토랑',
        address: '서울시 강남구 테헤란로 123',
        latitude: 37.5172,
        longitude: 127.0473,
        menuTypes: ['한식', '일식'],
        phoneNumber: '02-1234-5678',
        category: '음식점',
        description: '맛있는 레스토랑',
        openingHours: '10:00-22:00',
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.USER_PLACE.CREATE}`, async ({ request }) => {
          const formData = await request.formData();
          expect(formData.get('phoneNumber')).toBe('02-1234-5678');
          expect(formData.get('category')).toBe('음식점');
          expect(formData.get('description')).toBe('맛있는 레스토랑');
          expect(formData.get('openingHours')).toBe('10:00-22:00');

          return HttpResponse.json({
            id: 1,
            name: '테스트 레스토랑',
            address: '서울시 강남구 테헤란로 123',
            latitude: 37.5172,
            longitude: 127.0473,
            menuTypes: ['한식', '일식'],
            phoneNumber: '02-1234-5678',
            category: '음식점',
            description: '맛있는 레스토랑',
            openingHours: '10:00-22:00',
            status: 'PENDING',
            version: 1,
            photos: [],
            createdAt: '2024-01-15T00:00:00.000Z',
            updatedAt: '2024-01-15T00:00:00.000Z',
          } as UserPlace);
        })
      );

      const result = await userPlaceService.createUserPlace(createData);

      expect(result.phoneNumber).toBe('02-1234-5678');
      expect(result.category).toBe('음식점');
      expect(result.description).toBe('맛있는 레스토랑');
    });

    it('should create user place with images', async () => {
      const mockFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
      const createData: CreateUserPlaceRequest = {
        name: '테스트 레스토랑',
        address: '서울시 강남구 테헤란로 123',
        latitude: 37.5172,
        longitude: 127.0473,
        menuTypes: ['한식'],
        images: [mockFile],
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.USER_PLACE.CREATE}`, async ({ request }) => {
          const formData = await request.formData();
          const images = formData.getAll('images');
          expect(images.length).toBe(1);

          return HttpResponse.json({
            id: 1,
            name: '테스트 레스토랑',
            address: '서울시 강남구 테헤란로 123',
            latitude: 37.5172,
            longitude: 127.0473,
            menuTypes: ['한식'],
            status: 'PENDING',
            version: 1,
            photos: ['https://example.com/photo1.jpg'],
            createdAt: '2024-01-15T00:00:00.000Z',
            updatedAt: '2024-01-15T00:00:00.000Z',
          } as UserPlace);
        })
      );

      const result = await userPlaceService.createUserPlace(createData);

      expect(result.photos).toBeInstanceOf(Array);
      expect(result.photos?.length).toBe(1);
    });

    it('should fail with missing required fields', async () => {
      const createData = {
        name: '테스트 레스토랑',
      } as CreateUserPlaceRequest;

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.USER_PLACE.CREATE}`, () => {
          return HttpResponse.json(
            { message: '필수 필드가 누락되었습니다.' },
            { status: 400 }
          );
        })
      );

      await expect(userPlaceService.createUserPlace(createData)).rejects.toThrow();
    });
  });

  describe('getUserPlaces', () => {
    it('should get user places without query parameters', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.USER_PLACE.LIST}`, () => {
          return HttpResponse.json({
            items: [
              {
                id: 1,
                name: '테스트 레스토랑',
                status: 'APPROVED',
                createdAt: '2024-01-15T00:00:00.000Z',
              },
            ],
            pageInfo: {
              page: 1,
              limit: 20,
              totalCount: 1,
              hasNext: false,
            },
          });
        })
      );

      const result = await userPlaceService.getUserPlaces();

      expect(result.items).toBeInstanceOf(Array);
      expect(result.pageInfo).toBeDefined();
    });

    it('should get user places with pagination', async () => {
      const query: UserPlaceListQuery = {
        page: 2,
        limit: 10,
      };

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.USER_PLACE.LIST}`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('page')).toBe('2');
          expect(url.searchParams.get('limit')).toBe('10');

          return HttpResponse.json({
            items: [],
            pageInfo: {
              page: 2,
              limit: 10,
              totalCount: 5,
              hasNext: false,
            },
          });
        })
      );

      const result = await userPlaceService.getUserPlaces(query);

      expect(result.pageInfo.page).toBe(2);
      expect(result.pageInfo.limit).toBe(10);
    });

    it('should get user places with status filter', async () => {
      const query: UserPlaceListQuery = {
        status: 'PENDING',
      };

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.USER_PLACE.LIST}`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('status')).toBe('PENDING');

          return HttpResponse.json({
            items: [
              {
                id: 1,
                name: '대기 중 가게',
                status: 'PENDING',
                createdAt: '2024-01-15T00:00:00.000Z',
              },
            ],
            pageInfo: {
              page: 1,
              limit: 20,
              totalCount: 1,
              hasNext: false,
            },
          });
        })
      );

      const result = await userPlaceService.getUserPlaces(query);

      expect(result.items[0].status).toBe('PENDING');
    });

    it('should get user places with search query', async () => {
      const query: UserPlaceListQuery = {
        search: '테스트',
      };

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.USER_PLACE.LIST}`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('search')).toBe('테스트');

          return HttpResponse.json({
            items: [
              {
                id: 1,
                name: '테스트 레스토랑',
                status: 'APPROVED',
                createdAt: '2024-01-15T00:00:00.000Z',
              },
            ],
            pageInfo: {
              page: 1,
              limit: 20,
              totalCount: 1,
              hasNext: false,
            },
          });
        })
      );

      const result = await userPlaceService.getUserPlaces(query);

      expect(result.items[0].name).toContain('테스트');
    });
  });

  describe('getUserPlace', () => {
    it('should get user place detail successfully', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.USER_PLACE.DETAIL(1)}`, () => {
          return HttpResponse.json({
            id: 1,
            name: '테스트 레스토랑',
            address: '서울시 강남구 테헤란로 123',
            latitude: 37.5172,
            longitude: 127.0473,
            menuTypes: ['한식'],
            status: 'APPROVED',
            version: 1,
            photos: [],
            createdAt: '2024-01-15T00:00:00.000Z',
            updatedAt: '2024-01-15T00:00:00.000Z',
          } as UserPlace);
        })
      );

      const result = await userPlaceService.getUserPlace(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('테스트 레스토랑');
      expect(result.status).toBe('APPROVED');
    });

    it('should fail with non-existent place id', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.USER_PLACE.DETAIL(999)}`, () => {
          return HttpResponse.json(
            { message: '가게를 찾을 수 없습니다.' },
            { status: 404 }
          );
        })
      );

      await expect(userPlaceService.getUserPlace(999)).rejects.toThrow();
    });
  });

  describe('updateUserPlace', () => {
    it('should update user place successfully', async () => {
      const updateData: UpdateUserPlaceRequest = {
        version: 1,
        name: '수정된 레스토랑',
        address: '서울시 강남구 수정된 주소',
      };

      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.USER_PLACE.UPDATE(1)}`, async ({ request }) => {
          const formData = await request.formData();
          expect(formData.get('version')).toBe('1');
          expect(formData.get('name')).toBe('수정된 레스토랑');
          expect(formData.get('address')).toBe('서울시 강남구 수정된 주소');

          return HttpResponse.json({
            id: 1,
            name: '수정된 레스토랑',
            address: '서울시 강남구 수정된 주소',
            latitude: 37.5172,
            longitude: 127.0473,
            menuTypes: ['한식'],
            status: 'PENDING',
            version: 2,
            photos: [],
            createdAt: '2024-01-15T00:00:00.000Z',
            updatedAt: '2024-01-15T12:00:00.000Z',
          } as UserPlace);
        })
      );

      const result = await userPlaceService.updateUserPlace(1, updateData);

      expect(result.name).toBe('수정된 레스토랑');
      expect(result.version).toBe(2);
    });

    it('should update user place with menuTypes', async () => {
      const updateData: UpdateUserPlaceRequest = {
        version: 1,
        menuTypes: ['한식', '일식', '중식'],
      };

      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.USER_PLACE.UPDATE(1)}`, async ({ request }) => {
          const formData = await request.formData();
          const menuTypes = formData.getAll('menuTypes');
          expect(menuTypes).toEqual(['한식', '일식', '중식']);

          return HttpResponse.json({
            id: 1,
            name: '테스트 레스토랑',
            address: '서울시 강남구 테헤란로 123',
            latitude: 37.5172,
            longitude: 127.0473,
            menuTypes: ['한식', '일식', '중식'],
            status: 'PENDING',
            version: 2,
            photos: [],
            createdAt: '2024-01-15T00:00:00.000Z',
            updatedAt: '2024-01-15T12:00:00.000Z',
          } as UserPlace);
        })
      );

      const result = await userPlaceService.updateUserPlace(1, updateData);

      expect(result.menuTypes).toEqual(['한식', '일식', '중식']);
    });

    it('should update user place with existingPhotos and new images', async () => {
      const mockFile = new File(['image content'], 'new.jpg', { type: 'image/jpeg' });
      const updateData: UpdateUserPlaceRequest = {
        version: 1,
        existingPhotos: ['https://example.com/existing1.jpg'],
        images: [mockFile],
      };

      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.USER_PLACE.UPDATE(1)}`, async ({ request }) => {
          const formData = await request.formData();
          const existingPhotos = formData.getAll('existingPhotos');
          const images = formData.getAll('images');
          expect(existingPhotos).toEqual(['https://example.com/existing1.jpg']);
          expect(images.length).toBe(1);

          return HttpResponse.json({
            id: 1,
            name: '테스트 레스토랑',
            address: '서울시 강남구 테헤란로 123',
            latitude: 37.5172,
            longitude: 127.0473,
            menuTypes: ['한식'],
            status: 'PENDING',
            version: 2,
            photos: [
              'https://example.com/existing1.jpg',
              'https://example.com/new1.jpg',
            ],
            createdAt: '2024-01-15T00:00:00.000Z',
            updatedAt: '2024-01-15T12:00:00.000Z',
          } as UserPlace);
        })
      );

      const result = await userPlaceService.updateUserPlace(1, updateData);

      expect(result.photos?.length).toBe(2);
    });

    it('should fail with version conflict', async () => {
      const updateData: UpdateUserPlaceRequest = {
        version: 1,
        name: '수정된 레스토랑',
      };

      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.USER_PLACE.UPDATE(1)}`, () => {
          return HttpResponse.json(
            { message: '버전 충돌이 발생했습니다. 다시 시도해주세요.' },
            { status: 409 }
          );
        })
      );

      await expect(userPlaceService.updateUserPlace(1, updateData)).rejects.toThrow();
    });

    it('should fail with non-existent place id', async () => {
      const updateData: UpdateUserPlaceRequest = {
        version: 1,
        name: '수정된 레스토랑',
      };

      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.USER_PLACE.UPDATE(999)}`, () => {
          return HttpResponse.json(
            { message: '가게를 찾을 수 없습니다.' },
            { status: 404 }
          );
        })
      );

      await expect(userPlaceService.updateUserPlace(999, updateData)).rejects.toThrow();
    });
  });

  describe('deleteUserPlace', () => {
    it('should delete user place successfully', async () => {
      server.use(
        http.delete(`${BASE_URL}${ENDPOINTS.USER_PLACE.DELETE(1)}`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(userPlaceService.deleteUserPlace(1)).resolves.not.toThrow();
    });

    it('should fail with non-existent place id', async () => {
      server.use(
        http.delete(`${BASE_URL}${ENDPOINTS.USER_PLACE.DELETE(999)}`, () => {
          return HttpResponse.json(
            { message: '가게를 찾을 수 없습니다.' },
            { status: 404 }
          );
        })
      );

      await expect(userPlaceService.deleteUserPlace(999)).rejects.toThrow();
    });

    it('should fail without authentication', async () => {
      localStorage.clear();

      server.use(
        http.delete(`${BASE_URL}${ENDPOINTS.USER_PLACE.DELETE(1)}`, () => {
          return HttpResponse.json(
            { message: '인증이 필요합니다.' },
            { status: 401 }
          );
        })
      );

      await expect(userPlaceService.deleteUserPlace(1)).rejects.toThrow();
    });

    it('should fail when trying to delete approved place', async () => {
      server.use(
        http.delete(`${BASE_URL}${ENDPOINTS.USER_PLACE.DELETE(1)}`, () => {
          return HttpResponse.json(
            { message: '승인된 가게는 삭제할 수 없습니다.' },
            { status: 403 }
          );
        })
      );

      await expect(userPlaceService.deleteUserPlace(1)).rejects.toThrow();
    });
  });
});
