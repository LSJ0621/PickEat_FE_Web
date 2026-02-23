/**
 * Rating Service 테스트
 * 평점 관련 API 서비스 함수들을 테스트합니다.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ratingService } from '@/api/services/rating';
import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@shared/api/endpoints';
import apiClient from '@shared/api/client';
import type {
  SelectPlaceRequest,
  SubmitRatingRequest,
  SkipRatingRequest,
  PendingRating,
} from '@/types/rating';

const BASE_URL = 'http://localhost:3000';

describe('Rating Service', () => {
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

  describe('selectPlace', () => {
    it('should select place for rating successfully', async () => {
      const selectData: SelectPlaceRequest = {
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        placeName: '테스트 레스토랑',
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.RATING.SELECT}`, async ({ request }) => {
          const body = await request.json() as SelectPlaceRequest;
          expect(body.placeId).toBe('ChIJN1t_tDeuEmsRUsoyG83frY4');
          expect(body.placeName).toBe('테스트 레스토랑');

          return HttpResponse.json({
            id: 1,
            placeId: body.placeId,
            placeName: body.placeName,
            createdAt: '2024-01-15T12:00:00.000Z',
          } as PendingRating);
        })
      );

      const result = await ratingService.selectPlace(selectData);

      expect(result).toBeDefined();
      expect(result.placeId).toBe('ChIJN1t_tDeuEmsRUsoyG83frY4');
      expect(result.placeName).toBe('테스트 레스토랑');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('createdAt');
    });

    it('should fail with missing placeId', async () => {
      const selectData = {
        placeName: '테스트 레스토랑',
      } as SelectPlaceRequest;

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.RATING.SELECT}`, () => {
          return HttpResponse.json(
            { message: 'placeId는 필수입니다.' },
            { status: 400 }
          );
        })
      );

      await expect(ratingService.selectPlace(selectData)).rejects.toThrow();
    });

    it('should fail with missing placeName', async () => {
      const selectData = {
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      } as SelectPlaceRequest;

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.RATING.SELECT}`, () => {
          return HttpResponse.json(
            { message: 'placeName은 필수입니다.' },
            { status: 400 }
          );
        })
      );

      await expect(ratingService.selectPlace(selectData)).rejects.toThrow();
    });

    it('should fail when already has pending rating', async () => {
      const selectData: SelectPlaceRequest = {
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        placeName: '테스트 레스토랑',
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.RATING.SELECT}`, () => {
          return HttpResponse.json(
            { message: '이미 평점 대기 중인 가게가 있습니다.' },
            { status: 400 }
          );
        })
      );

      await expect(ratingService.selectPlace(selectData)).rejects.toThrow();
    });

    it('should fail without authentication', async () => {
      localStorage.clear();

      const selectData: SelectPlaceRequest = {
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        placeName: '테스트 레스토랑',
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.RATING.SELECT}`, () => {
          return HttpResponse.json(
            { message: '인증이 필요합니다.' },
            { status: 401 }
          );
        })
      );

      await expect(ratingService.selectPlace(selectData)).rejects.toThrow();
    });
  });

  describe('getPendingRating', () => {
    it('should get pending rating successfully', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.RATING.PENDING}`, () => {
          return HttpResponse.json({
            id: 1,
            placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
            placeName: '테스트 레스토랑',
            createdAt: '2024-01-15T12:00:00.000Z',
          } as PendingRating);
        })
      );

      const result = await ratingService.getPendingRating();

      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
      expect(result?.placeId).toBe('ChIJN1t_tDeuEmsRUsoyG83frY4');
      expect(result?.placeName).toBe('테스트 레스토랑');
    });

    it('should return null when no pending rating', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.RATING.PENDING}`, () => {
          return HttpResponse.json(null);
        })
      );

      const result = await ratingService.getPendingRating();

      expect(result).toBeNull();
    });

    it('should fail without authentication', async () => {
      localStorage.clear();

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.RATING.PENDING}`, () => {
          return HttpResponse.json(
            { message: '인증이 필요합니다.' },
            { status: 401 }
          );
        })
      );

      await expect(ratingService.getPendingRating()).rejects.toThrow();
    });
  });

  describe('submitRating', () => {
    it('should submit rating successfully', async () => {
      const submitData: SubmitRatingRequest = {
        pendingRatingId: 1,
        rating: 5,
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.RATING.SUBMIT}`, async ({ request }) => {
          const body = await request.json() as SubmitRatingRequest;
          expect(body.pendingRatingId).toBe(1);
          expect(body.rating).toBe(5);

          return HttpResponse.json({
            success: true,
          });
        })
      );

      const result = await ratingService.submitRating(submitData);

      expect(result.success).toBe(true);
    });

    it('should submit rating with minimum value (1)', async () => {
      const submitData: SubmitRatingRequest = {
        pendingRatingId: 1,
        rating: 1,
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.RATING.SUBMIT}`, async ({ request }) => {
          const body = await request.json() as SubmitRatingRequest;
          expect(body.rating).toBe(1);

          return HttpResponse.json({
            success: true,
          });
        })
      );

      const result = await ratingService.submitRating(submitData);

      expect(result.success).toBe(true);
    });

    it('should fail with invalid rating (0)', async () => {
      const submitData: SubmitRatingRequest = {
        pendingRatingId: 1,
        rating: 0,
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.RATING.SUBMIT}`, () => {
          return HttpResponse.json(
            { message: '평점은 1에서 5 사이의 값이어야 합니다.' },
            { status: 400 }
          );
        })
      );

      await expect(ratingService.submitRating(submitData)).rejects.toThrow();
    });

    it('should fail with invalid rating (6)', async () => {
      const submitData: SubmitRatingRequest = {
        pendingRatingId: 1,
        rating: 6,
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.RATING.SUBMIT}`, () => {
          return HttpResponse.json(
            { message: '평점은 1에서 5 사이의 값이어야 합니다.' },
            { status: 400 }
          );
        })
      );

      await expect(ratingService.submitRating(submitData)).rejects.toThrow();
    });

    it('should fail with non-existent pending rating id', async () => {
      const submitData: SubmitRatingRequest = {
        pendingRatingId: 999,
        rating: 5,
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.RATING.SUBMIT}`, () => {
          return HttpResponse.json(
            { message: '평점 대기 정보를 찾을 수 없습니다.' },
            { status: 404 }
          );
        })
      );

      await expect(ratingService.submitRating(submitData)).rejects.toThrow();
    });

    it('should fail without authentication', async () => {
      localStorage.clear();

      const submitData: SubmitRatingRequest = {
        pendingRatingId: 1,
        rating: 5,
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.RATING.SUBMIT}`, () => {
          return HttpResponse.json(
            { message: '인증이 필요합니다.' },
            { status: 401 }
          );
        })
      );

      await expect(ratingService.submitRating(submitData)).rejects.toThrow();
    });
  });

  describe('skipRating', () => {
    it('should skip rating successfully', async () => {
      const skipData: SkipRatingRequest = {
        pendingRatingId: 1,
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.RATING.SKIP}`, async ({ request }) => {
          const body = await request.json() as SkipRatingRequest;
          expect(body.pendingRatingId).toBe(1);

          return HttpResponse.json({
            success: true,
          });
        })
      );

      const result = await ratingService.skipRating(skipData);

      expect(result.success).toBe(true);
    });

    it('should fail with non-existent pending rating id', async () => {
      const skipData: SkipRatingRequest = {
        pendingRatingId: 999,
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.RATING.SKIP}`, () => {
          return HttpResponse.json(
            { message: '평점 대기 정보를 찾을 수 없습니다.' },
            { status: 404 }
          );
        })
      );

      await expect(ratingService.skipRating(skipData)).rejects.toThrow();
    });

    it('should fail without authentication', async () => {
      localStorage.clear();

      const skipData: SkipRatingRequest = {
        pendingRatingId: 1,
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.RATING.SKIP}`, () => {
          return HttpResponse.json(
            { message: '인증이 필요합니다.' },
            { status: 401 }
          );
        })
      );

      await expect(ratingService.skipRating(skipData)).rejects.toThrow();
    });

    it('should fail with missing pendingRatingId', async () => {
      const skipData = {} as SkipRatingRequest;

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.RATING.SKIP}`, () => {
          return HttpResponse.json(
            { message: 'pendingRatingId는 필수입니다.' },
            { status: 400 }
          );
        })
      );

      await expect(ratingService.skipRating(skipData)).rejects.toThrow();
    });
  });
});
