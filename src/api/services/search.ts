/**
 * 검색 관련 API 서비스
 */

import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
    SearchRestaurantsRequest,
    SearchRestaurantsResponse
} from '@/types/search';

export const searchService = {
  /**
   * 주변 식당 검색
   * @param request - 검색 요청 데이터 (메뉴명, 위도, 경도 등)
   */
  restaurants: async (
    request: SearchRestaurantsRequest
  ): Promise<SearchRestaurantsResponse> => {
    const response = await apiClient.post<SearchRestaurantsResponse>(
      ENDPOINTS.SEARCH.RESTAURANTS,
      request
    );
    return response.data;
  },
};

