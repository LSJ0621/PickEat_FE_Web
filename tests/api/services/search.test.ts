/**
 * Search Service Tests
 * 검색 관련 API 서비스 함수들을 테스트합니다.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { searchService } from '@/api/services/search';
import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@/api/endpoints';
import type { SearchRestaurantsRequest } from '@/types/search';
import { mockRestaurants } from '@tests/mocks/handlers/search';

const BASE_URL = 'http://localhost:3000';

describe('Search Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('restaurants', () => {
    it('should search restaurants successfully with all parameters', async () => {
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.SEARCH.RESTAURANTS}`, async ({ request }) => {
          const body = (await request.json()) as SearchRestaurantsRequest;

          if (!body.menuName) {
            return HttpResponse.json(
              { message: '메뉴 이름을 입력해주세요.' },
              { status: 400 }
            );
          }

          return HttpResponse.json({ restaurants: mockRestaurants });
        })
      );

      const request: SearchRestaurantsRequest = {
        menuName: '김치찌개',
        latitude: 37.5636,
        longitude: 126.9869,
      };

      const result = await searchService.restaurants(request);

      expect(result.restaurants).toBeDefined();
      expect(Array.isArray(result.restaurants)).toBe(true);
      expect(result.restaurants.length).toBeGreaterThan(0);
    });

    it('should search restaurants with all required parameters', async () => {
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.SEARCH.RESTAURANTS}`, async ({ request }) => {
          const body = (await request.json()) as SearchRestaurantsRequest;

          if (!body.menuName) {
            return HttpResponse.json(
              { message: '메뉴 이름을 입력해주세요.' },
              { status: 400 }
            );
          }

          return HttpResponse.json({ restaurants: mockRestaurants });
        })
      );

      const request: SearchRestaurantsRequest = {
        menuName: '불고기',
        latitude: 37.4979,
        longitude: 127.0276,
      };

      const result = await searchService.restaurants(request);

      expect(result.restaurants).toBeDefined();
      expect(Array.isArray(result.restaurants)).toBe(true);
    });

    it('should filter restaurants by menu name', async () => {
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.SEARCH.RESTAURANTS}`, async ({ request }) => {
          const body = (await request.json()) as SearchRestaurantsRequest;

          const filtered = mockRestaurants.filter((r) =>
            r.name.includes(body.menuName)
          );

          return HttpResponse.json({
            restaurants: filtered.length > 0 ? filtered : mockRestaurants,
          });
        })
      );

      const result = await searchService.restaurants({
        menuName: '김치찌개',
        latitude: 37.5636,
        longitude: 126.9869,
      });

      expect(result.restaurants).toBeDefined();
      expect(result.restaurants.some((r) => r.name.includes('김치찌개'))).toBe(true);
    });

    it('should fail with missing menu parameter', async () => {
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.SEARCH.RESTAURANTS}`, () => {
          return HttpResponse.json(
            { message: '메뉴 이름을 입력해주세요.' },
            { status: 400 }
          );
        })
      );

      await expect(
        searchService.restaurants({
          menuName: '',
          latitude: 37.5636,
          longitude: 126.9869,
        })
      ).rejects.toThrow();
    });

    it('should fail with missing location parameters', async () => {
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.SEARCH.RESTAURANTS}`, () => {
          return HttpResponse.json(
            { message: '위치 정보가 필요합니다.' },
            { status: 400 }
          );
        })
      );

      await expect(
        searchService.restaurants({
          menuName: '김치찌개',
          latitude: 0,
          longitude: 0,
        })
      ).rejects.toThrow();
    });

    it('should handle server error gracefully', async () => {
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.SEARCH.RESTAURANTS}`, () => {
          return HttpResponse.json(
            { message: '서버 오류가 발생했습니다.' },
            { status: 500 }
          );
        })
      );

      await expect(
        searchService.restaurants({
          menuName: '김치찌개',
          latitude: 37.5636,
          longitude: 126.9869,
        })
      ).rejects.toThrow();
    });

    it('should return empty array when no restaurants found', async () => {
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.SEARCH.RESTAURANTS}`, () => {
          return HttpResponse.json({ restaurants: [] });
        })
      );

      const result = await searchService.restaurants({
        menuName: '없는메뉴',
        latitude: 37.5636,
        longitude: 126.9869,
      });

      expect(result.restaurants).toEqual([]);
    });

    it('should handle network error', async () => {
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.SEARCH.RESTAURANTS}`, () => {
          return HttpResponse.error();
        })
      );

      await expect(
        searchService.restaurants({
          menuName: '김치찌개',
          latitude: 37.5636,
          longitude: 126.9869,
        })
      ).rejects.toThrow();
    });

    it('should include all restaurant properties in response', async () => {
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.SEARCH.RESTAURANTS}`, () => {
          return HttpResponse.json({ restaurants: mockRestaurants });
        })
      );

      const result = await searchService.restaurants({
        menuName: '김치찌개',
        latitude: 37.5636,
        longitude: 126.9869,
      });

      expect(result.restaurants.length).toBeGreaterThan(0);

      const restaurant = result.restaurants[0];
      expect(restaurant.name).toBeDefined();
      expect(restaurant.address).toBeDefined();
    });
  });
});
