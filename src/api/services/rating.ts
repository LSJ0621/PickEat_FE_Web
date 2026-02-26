/**
 * 평점 관련 API 서비스
 */

import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  PendingRating,
  SelectPlaceRequest,
  SubmitRatingRequest,
  SkipRatingRequest,
  RatingHistoryResponse,
  GetRatingHistoryParams,
  DismissRatingRequest,
} from '@/types/rating';

export const ratingService = {
  // 가게 선택
  selectPlace: async (data: SelectPlaceRequest): Promise<PendingRating> => {
    const response = await apiClient.post<PendingRating>(
      ENDPOINTS.RATING.SELECT,
      data
    );
    return response.data;
  },

  // 평점 대기 중인 가게 조회
  getPendingRating: async (): Promise<PendingRating | null> => {
    const response = await apiClient.get<PendingRating | null>(
      ENDPOINTS.RATING.PENDING
    );
    return response.data;
  },

  // 평점 제출
  submitRating: async (data: SubmitRatingRequest): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>(
      ENDPOINTS.RATING.SUBMIT,
      data
    );
    return response.data;
  },

  // 평점 건너뛰기
  skipRating: async (data: SkipRatingRequest): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>(
      ENDPOINTS.RATING.SKIP,
      data
    );
    return response.data;
  },

  // 평점 이력 조회
  getRatingHistory: async (params?: GetRatingHistoryParams): Promise<RatingHistoryResponse> => {
    const response = await apiClient.get<RatingHistoryResponse>(ENDPOINTS.RATING.HISTORY, { params });
    return response.data;
  },

  // 평점 프롬프트 무시
  dismissRating: async (data: DismissRatingRequest): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>(ENDPOINTS.RATING.DISMISS, data);
    return response.data;
  },
};
