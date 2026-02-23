/**
 * Menu Service Tests
 * 메뉴 관련 API 서비스 함수들을 테스트합니다.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { menuService } from '@/api/services/menu';
import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@shared/api/endpoints';
import {
  mockMenuRecommendation,
  mockPlaceRecommendations,
  mockRestaurantBlogs,
  mockPlaceHistory,
  mockPlaceDetail,
  mockMenuSelections,
} from '@tests/mocks/handlers/menu';

const BASE_URL = 'http://localhost:3000';

describe('Menu Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('recommend', () => {
    it('should get menu recommendations successfully', async () => {
      const result = await menuService.recommend('점심 메뉴 추천해줘');

      expect(result.id).toBe(mockMenuRecommendation.id);
      expect(result.recommendations).toEqual(mockMenuRecommendation.recommendations);
      expect(result.reason).toBe(mockMenuRecommendation.reason);
      expect(result.recommendedAt).toBeDefined();
    });

    it('should fail with empty prompt', async () => {
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.MENU.RECOMMEND}`, () => {
          return HttpResponse.json(
            { message: '프롬프트를 입력해주세요.' },
            { status: 400 }
          );
        })
      );

      await expect(menuService.recommend('')).rejects.toThrow();
    });

    it('should handle server error', async () => {
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.MENU.RECOMMEND}`, () => {
          return HttpResponse.json(
            { message: '서버 오류가 발생했습니다.' },
            { status: 500 }
          );
        })
      );

      await expect(menuService.recommend('점심 메뉴')).rejects.toThrow();
    });
  });

  describe('recommendPlaces', () => {
    it('should get place recommendations successfully', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.MENU.RECOMMEND_PLACES}`, () => {
          return HttpResponse.json(mockPlaceRecommendations);
        })
      );

      const result = await menuService.recommendPlaces({
        query: '김치찌개',
        historyId: 1,
        menuName: '김치찌개',
      });

      expect(result.recommendations).toHaveLength(2);
      expect(result.recommendations[0].placeId).toBe('ChIJ1234567890');
      expect(result.recommendations[0].name).toBe('명동 김치찌개');
    });

    it('should fail with missing menu name', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.MENU.RECOMMEND_PLACES}`, () => {
          return HttpResponse.json(
            { message: '메뉴 이름을 입력해주세요.' },
            { status: 400 }
          );
        })
      );

      await expect(
        menuService.recommendPlaces({
          query: '',
          historyId: 1,
          menuName: '',
        })
      ).rejects.toThrow();
    });
  });

  describe('getRestaurantBlogs', () => {
    it('should get restaurant blogs successfully', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.MENU.RESTAURANT_BLOGS}`, ({ request }) => {
          const url = new URL(request.url);
          const query = url.searchParams.get('query');

          if (!query) {
            return HttpResponse.json(
              { message: '가게 이름을 입력해주세요.' },
              { status: 400 }
            );
          }

          return HttpResponse.json(mockRestaurantBlogs);
        })
      );

      const result = await menuService.getRestaurantBlogs('김치찌개', '명동 김치찌개');

      expect(result.blogs).toHaveLength(2);
      expect(result.blogs[0].title).toBe('명동 김치찌개 맛집 리뷰');
      expect(result.blogs[0].source).toBe('naver');
    });

    it('should get blogs without restaurant name', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.MENU.RESTAURANT_BLOGS}`, ({ request }) => {
          const url = new URL(request.url);
          const query = url.searchParams.get('query');

          if (!query) {
            return HttpResponse.json(
              { message: '가게 이름을 입력해주세요.' },
              { status: 400 }
            );
          }

          return HttpResponse.json(mockRestaurantBlogs);
        })
      );

      const result = await menuService.getRestaurantBlogs('김치찌개');

      expect(result.blogs).toBeDefined();
      expect(Array.isArray(result.blogs)).toBe(true);
    });

    it('should fail with missing query', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.MENU.RESTAURANT_BLOGS}`, () => {
          return HttpResponse.json(
            { message: '가게 이름을 입력해주세요.' },
            { status: 400 }
          );
        })
      );

      await expect(menuService.getRestaurantBlogs('')).rejects.toThrow();
    });
  });

  describe('getPlaceRecommendationsByHistoryId', () => {
    it('should get place history successfully', async () => {
      const result = await menuService.getPlaceRecommendationsByHistoryId(1);

      expect(result.history).toBeDefined();
      expect(result.history.id).toBe(1);
      expect(result.places).toHaveLength(1);
      expect(result.places[0].name).toBe('명동 김치찌개');
    });

    it('should fail with non-existent history id', async () => {
      server.use(
        http.get(`${BASE_URL}/menu/recommendations/:id`, ({ params }) => {
          if (params.id === '999') {
            return HttpResponse.json(
              { message: '추천 이력을 찾을 수 없습니다.' },
              { status: 404 }
            );
          }
          return HttpResponse.json(mockPlaceHistory);
        })
      );

      await expect(
        menuService.getPlaceRecommendationsByHistoryId(999)
      ).rejects.toThrow();
    });
  });

  describe('getPlaceDetail', () => {
    it('should get place detail successfully', async () => {
      const result = await menuService.getPlaceDetail('ChIJ1234567890');

      expect(result.place).toBeDefined();
      expect(result.place.id).toBe('ChIJ1234567890');
      expect(result.place.name).toBe('명동 김치찌개');
      expect(result.place.rating).toBe(4.5);
      expect(result.place.reviews).toHaveLength(2);
    });

    it('should fail with invalid place id', async () => {
      server.use(
        http.get(`${BASE_URL}/menu/places/:placeId/detail`, ({ params }) => {
          if (params.placeId === 'invalid-place') {
            return HttpResponse.json(
              { message: '장소를 찾을 수 없습니다.' },
              { status: 404 }
            );
          }
          return HttpResponse.json(mockPlaceDetail);
        })
      );

      await expect(menuService.getPlaceDetail('invalid-place')).rejects.toThrow();
    });
  });

  describe('createMenuSelection', () => {
    it('should create menu selection successfully', async () => {
      const result = await menuService.createMenuSelection({
        menus: [
          { slot: 'breakfast', name: '토스트' },
          { slot: 'lunch', name: '김치찌개' },
        ],
        historyId: 1,
      });

      expect(result.selection).toBeDefined();
      expect(result.selection.id).toBeDefined();
      expect(result.selection.menuPayload).toBeDefined();
      expect(result.selection.selectedDate).toBeDefined();
    });

    it('should create menu selection without history id', async () => {
      const result = await menuService.createMenuSelection({
        menus: [
          { slot: 'dinner', name: '불고기' },
        ],
      });

      expect(result.selection).toBeDefined();
      expect(result.selection.historyId).toBeNull();
    });

    it('should fail with empty menus array', async () => {
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.MENU.SELECTIONS}`, () => {
          return HttpResponse.json(
            { message: '메뉴를 선택해주세요.' },
            { status: 400 }
          );
        })
      );

      await expect(
        menuService.createMenuSelection({
          menus: [],
        })
      ).rejects.toThrow();
    });
  });

  describe('getMenuSelections', () => {
    it('should get all menu selections without date filter', async () => {
      const result = await menuService.getMenuSelections();

      expect(result.selections).toBeDefined();
      expect(Array.isArray(result.selections)).toBe(true);
      expect(result.selections.length).toBeGreaterThan(0);
    });

    it('should get menu selections filtered by date', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.MENU.SELECTIONS_HISTORY}`, ({ request }) => {
          const url = new URL(request.url);
          const date = url.searchParams.get('date');

          const filtered = mockMenuSelections.filter((s) => s.selectedDate === date);

          return HttpResponse.json({ selections: filtered });
        })
      );

      const result = await menuService.getMenuSelections('2024-01-15');

      expect(result.selections).toBeDefined();
      expect(result.selections.every((s) => s.selectedDate === '2024-01-15')).toBe(true);
    });

    it('should return empty array when no selections found for date', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.MENU.SELECTIONS_HISTORY}`, () => {
          return HttpResponse.json({ selections: [] });
        })
      );

      const result = await menuService.getMenuSelections('2025-12-31');

      expect(result.selections).toEqual([]);
    });
  });

  describe('updateMenuSelection', () => {
    it('should update menu selection successfully', async () => {
      server.use(
        http.patch(`${BASE_URL}/menu/selections/:id`, async ({ params, request }) => {
          const { id } = params;
          const body = (await request.json()) as {
            breakfast?: string[];
            lunch?: string[];
            dinner?: string[];
            etc?: string[];
            cancel?: boolean;
          };

          const selection = mockMenuSelections.find((s) => s.id === Number(id));
          if (!selection) {
            return HttpResponse.json(
              { message: '메뉴 선택을 찾을 수 없습니다.' },
              { status: 404 }
            );
          }

          return HttpResponse.json({
            selection: {
              ...selection,
              menuPayload: {
                breakfast: body.breakfast ?? selection.menuPayload.breakfast,
                lunch: body.lunch ?? selection.menuPayload.lunch,
                dinner: body.dinner ?? selection.menuPayload.dinner,
                etc: body.etc ?? selection.menuPayload.etc,
              },
            },
          });
        })
      );

      const result = await menuService.updateMenuSelection(1, {
        breakfast: ['샌드위치', '주스'],
        lunch: ['파스타'],
        dinner: ['피자'],
        etc: [],
      });

      expect(result.selection).toBeDefined();
      expect(result.selection.id).toBe(1);
      expect(result.selection.menuPayload.breakfast).toContain('샌드위치');
    });

    it('should cancel menu selection', async () => {
      server.use(
        http.patch(`${BASE_URL}/menu/selections/:id`, async ({ request }) => {
          const body = (await request.json()) as { cancel?: boolean };

          if (body.cancel) {
            return HttpResponse.json({ message: '메뉴 선택이 취소되었습니다.' });
          }

          return HttpResponse.json({
            selection: mockMenuSelections[0],
          });
        })
      );

      const result = await menuService.updateMenuSelection(1, {
        cancel: true,
      });

      expect(result).toBeDefined();
    });

    it('should fail with non-existent selection id', async () => {
      server.use(
        http.patch(`${BASE_URL}/menu/selections/:id`, ({ params }) => {
          if (params.id === '999') {
            return HttpResponse.json(
              { message: '메뉴 선택을 찾을 수 없습니다.' },
              { status: 404 }
            );
          }
          return HttpResponse.json({
            selection: mockMenuSelections[0],
          });
        })
      );

      await expect(
        menuService.updateMenuSelection(999, {
          breakfast: ['test'],
        })
      ).rejects.toThrow();
    });
  });
});
