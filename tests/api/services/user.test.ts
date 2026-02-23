/**
 * User Service 테스트
 * 유저 관련 API 서비스 함수들을 테스트합니다.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userService } from '@/api/services/user';
import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@shared/api/endpoints';
import type { SelectedAddress } from '@/types/user';

const BASE_URL = 'http://localhost:3000';

describe('User Service', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'valid-token');
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('searchAddress', () => {
    it('should search addresses successfully', async () => {
      const result = await userService.searchAddress('테헤란로');

      expect(result.meta.total_count).toBeGreaterThan(0);
      expect(result.addresses).toBeInstanceOf(Array);
      expect(result.addresses[0]).toHaveProperty('roadAddress');
      expect(result.addresses[0]).toHaveProperty('latitude');
      expect(result.addresses[0]).toHaveProperty('longitude');
    });

    it('should fail with short query', async () => {
      await expect(userService.searchAddress('ㅁ')).rejects.toThrow();
    });

    it('should return empty results for no matches', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.USER.ADDRESS_SEARCH}`, () => {
          return HttpResponse.json({
            meta: { total_count: 0, pageable_count: 0, is_end: true },
            addresses: [],
          });
        })
      );

      const result = await userService.searchAddress('존재하지않는주소');

      expect(result.meta.total_count).toBe(0);
      expect(result.addresses).toEqual([]);
    });
  });

  describe('setAddress', () => {
    it('should set address successfully', async () => {
      const selectedAddress: SelectedAddress = {
        address: '서울시 강남구 테헤란로 123',
        roadAddress: '서울특별시 강남구 테헤란로 123',
        postalCode: '06236',
        latitude: '37.5172',
        longitude: '127.0473',
      };

      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.USER.ADDRESS_SET}`, async ({ request }) => {
          const body = (await request.json()) as { selectedAddress: SelectedAddress };

          return HttpResponse.json({
            id: 1,
            roadAddress: body.selectedAddress.roadAddress ?? body.selectedAddress.address,
            postalCode: body.selectedAddress.postalCode,
            latitude: parseFloat(body.selectedAddress.latitude),
            longitude: parseFloat(body.selectedAddress.longitude),
            isDefault: true,
            isSearchAddress: true,
            alias: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        })
      );

      const result = await userService.setAddress(selectedAddress);

      expect(result.roadAddress).toBeDefined();
      expect(result.latitude).toBe(37.5172);
      expect(result.longitude).toBe(127.0473);
    });
  });

  describe('getPreferences', () => {
    it('should get preferences successfully', async () => {
      const result = await userService.getPreferences();

      expect(result.preferences).toBeDefined();
      expect(result.preferences.likes).toBeInstanceOf(Array);
      expect(result.preferences.dislikes).toBeInstanceOf(Array);
    });
  });

  describe('setPreferences', () => {
    it('should set preferences successfully', async () => {
      const result = await userService.setPreferences({
        likes: ['한식', '일식'],
        dislikes: ['매운 음식'],
      });

      expect(result.preferences).toBeDefined();
      expect(result.preferences.likes).toContain('한식');
      expect(result.preferences.dislikes).toContain('매운 음식');
    });

    it('should set preferences with empty arrays', async () => {
      const result = await userService.setPreferences({
        likes: [],
        dislikes: [],
      });

      expect(result.preferences).toBeDefined();
    });
  });

  describe('getRecommendationHistory', () => {
    it('should get recommendation history without parameters', async () => {
      const result = await userService.getRecommendationHistory();

      expect(result.items).toBeInstanceOf(Array);
      expect(result.pageInfo).toBeDefined();
      expect(result.pageInfo.page).toBeDefined();
      expect(result.pageInfo.limit).toBeDefined();
    });

    it('should get recommendation history with pagination', async () => {
      const result = await userService.getRecommendationHistory({
        page: 1,
        limit: 10,
      });

      expect(result.items).toBeInstanceOf(Array);
      expect(result.pageInfo.page).toBe(1);
      expect(result.pageInfo.limit).toBe(10);
    });

    it('should get recommendation history with date filter', async () => {
      const result = await userService.getRecommendationHistory({
        date: '2024-01-15',
      });

      expect(result.items).toBeInstanceOf(Array);
    });

    it('should normalize hasPlaceRecommendations field', async () => {
      const result = await userService.getRecommendationHistory();

      result.items.forEach((item) => {
        expect(item).toHaveProperty('hasPlaceRecommendations');
        expect(typeof item.hasPlaceRecommendations).toBe('boolean');
      });
    });

    it('should handle hasPlaceRecommendation field name variant', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.RECOMMENDATION_HISTORY}`, () => {
          return HttpResponse.json({
            items: [
              {
                id: 1,
                recommendations: ['김치찌개'],
                prompt: '점심 메뉴',
                reason: '한식',
                recommendedAt: '2024-01-15T12:00:00.000Z',
                requestAddress: '서울',
                hasPlaceRecommendation: true, // Different field name
              },
            ],
            pageInfo: {
              page: 1,
              limit: 10,
              totalCount: 1,
              hasNext: false,
            },
          });
        })
      );

      const result = await userService.getRecommendationHistory();

      expect(result.items[0].hasPlaceRecommendations).toBe(true);
    });

    it('should handle has_place_recommendations snake_case field', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.RECOMMENDATION_HISTORY}`, () => {
          return HttpResponse.json({
            items: [
              {
                id: 1,
                recommendations: ['김치찌개'],
                prompt: '점심 메뉴',
                reason: '한식',
                recommendedAt: '2024-01-15T12:00:00.000Z',
                requestAddress: '서울',
                has_place_recommendations: true, // Snake case
              },
            ],
            pageInfo: {
              page: 1,
              limit: 10,
              totalCount: 1,
              hasNext: false,
            },
          });
        })
      );

      const result = await userService.getRecommendationHistory();

      expect(result.items[0].hasPlaceRecommendations).toBe(true);
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      const result = await userService.deleteAccount();

      expect(result.message).toBe('계정이 삭제되었습니다.');
    });
  });

  describe('getAddresses', () => {
    it('should get addresses list successfully', async () => {
      const result = await userService.getAddresses();

      expect(result.addresses).toBeInstanceOf(Array);
      expect(result.addresses.length).toBeGreaterThan(0);
      expect(result.addresses[0]).toHaveProperty('id');
      expect(result.addresses[0]).toHaveProperty('roadAddress');
    });

    it('should handle array response format', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.USER.ADDRESSES}`, () => {
          // Server returns array directly
          return HttpResponse.json([
            {
              id: 1,
              roadAddress: '서울시 강남구 테헤란로 123',
              postalCode: '06236',
              latitude: 37.5172,
              longitude: 127.0473,
              isDefault: true,
              isSearchAddress: true,
              alias: '회사',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
          ]);
        })
      );

      const result = await userService.getAddresses();

      expect(result.addresses).toBeInstanceOf(Array);
      expect(result.addresses.length).toBe(1);
    });
  });

  describe('getDefaultAddress', () => {
    it('should get default address successfully', async () => {
      const result = await userService.getDefaultAddress();

      expect(result.address).toBeDefined();
      if (result.address) {
        expect(result.address.isDefault).toBe(true);
      }
    });

    it('should handle no default address', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.USER.ADDRESS_DEFAULT}`, () => {
          return HttpResponse.json({ address: null });
        })
      );

      const result = await userService.getDefaultAddress();

      expect(result.address).toBeNull();
    });
  });

  describe('createAddress', () => {
    it('should create address successfully', async () => {
      const result = await userService.createAddress({
        selectedAddress: {
          address: '서울시 강남구 테헤란로 789',
          roadAddress: '서울특별시 강남구 테헤란로 789',
          postalCode: '06237',
          latitude: '37.5200',
          longitude: '127.0500',
        },
        alias: '새 주소',
        isDefault: false,
      });

      expect(result).toBeDefined();
      expect(result.roadAddress).toBeDefined();
      expect(result.latitude).toBeDefined();
      expect(result.longitude).toBeDefined();
    });

    it('should create default address', async () => {
      const result = await userService.createAddress({
        selectedAddress: {
          address: '서울시 강남구 테헤란로 789',
          roadAddress: '서울특별시 강남구 테헤란로 789',
          postalCode: '06237',
          latitude: '37.5200',
          longitude: '127.0500',
        },
        isDefault: true,
      });

      expect(result.isDefault).toBe(true);
    });
  });

  describe('updateAddress', () => {
    it('should update address successfully', async () => {
      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.USER.ADDRESS_BY_ID(1)}`, async ({ request }) => {
          const body = (await request.json()) as { alias?: string };

          return HttpResponse.json({
            id: 1,
            roadAddress: '서울시 강남구 테헤란로 123',
            postalCode: '06236',
            latitude: 37.5172,
            longitude: 127.0473,
            isDefault: true,
            isSearchAddress: true,
            alias: body.alias ?? '회사',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: new Date().toISOString(),
          });
        })
      );

      const result = await userService.updateAddress(1, {
        alias: '업데이트된 별칭',
      });

      expect(result.id).toBe(1);
      expect(result.alias).toBe('업데이트된 별칭');
    });
  });

  describe('deleteAddresses', () => {
    it('should delete multiple addresses successfully', async () => {
      const result = await userService.deleteAddresses([1, 2]);

      expect(result.message).toContain('2개의 주소가 삭제되었습니다.');
    });

    it('should delete single address', async () => {
      const result = await userService.deleteAddresses([1]);

      expect(result.message).toContain('1개의 주소가 삭제되었습니다.');
    });

    it('should fail with empty array', async () => {
      await expect(userService.deleteAddresses([])).rejects.toThrow();
    });
  });

  describe('setDefaultAddress', () => {
    it('should set default address successfully', async () => {
      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.USER.ADDRESS_SET_DEFAULT(2)}`, () => {
          return HttpResponse.json({
            id: 2,
            roadAddress: '서울시 서초구 서초대로 456',
            postalCode: '06621',
            latitude: 37.4969,
            longitude: 127.0278,
            isDefault: true, // Changed to default
            isSearchAddress: false,
            alias: '집',
            createdAt: '2024-01-02T00:00:00.000Z',
            updatedAt: new Date().toISOString(),
          });
        })
      );

      const result = await userService.setDefaultAddress(2);

      expect(result.id).toBe(2);
      expect(result.isDefault).toBe(true);
    });

    it('should fail with non-existent address id', async () => {
      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.USER.ADDRESS_SET_DEFAULT(999)}`, () => {
          return HttpResponse.json(
            { message: '주소를 찾을 수 없습니다.' },
            { status: 404 }
          );
        })
      );

      await expect(userService.setDefaultAddress(999)).rejects.toThrow();
    });
  });

  describe('setSearchAddress', () => {
    it('should set search address successfully', async () => {
      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.USER.ADDRESS_SET_SEARCH(2)}`, () => {
          return HttpResponse.json({
            id: 2,
            roadAddress: '서울시 서초구 서초대로 456',
            postalCode: '06621',
            latitude: 37.4969,
            longitude: 127.0278,
            isDefault: false,
            isSearchAddress: true, // Changed to search address
            alias: '집',
            createdAt: '2024-01-02T00:00:00.000Z',
            updatedAt: new Date().toISOString(),
          });
        })
      );

      const result = await userService.setSearchAddress(2);

      expect(result.id).toBe(2);
      expect(result.isSearchAddress).toBe(true);
    });

    it('should fail with non-existent address id', async () => {
      server.use(
        http.patch(`${BASE_URL}${ENDPOINTS.USER.ADDRESS_SET_SEARCH(999)}`, () => {
          return HttpResponse.json(
            { message: '주소를 찾을 수 없습니다.' },
            { status: 404 }
          );
        })
      );

      await expect(userService.setSearchAddress(999)).rejects.toThrow();
    });
  });
});
