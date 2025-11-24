/**
 * 메뉴 관련 API 서비스
 */

import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  MenuRecommendationResponse,
  PlaceDetailResponse,
  PlaceHistoryResponse,
  PlaceRecommendationResponse,
  RestaurantBlogsResponse,
} from '@/types/menu';

export const menuService = {
  /**
   * 메뉴 추천 받기
   * @param prompt - 사용자가 입력한 메뉴 추천 요청 텍스트
   */
  recommend: async (prompt: string): Promise<MenuRecommendationResponse> => {
    const response = await apiClient.post<MenuRecommendationResponse>(
      ENDPOINTS.MENU.RECOMMEND,
      { prompt }
    );
    return response.data;
  },
  recommendPlaces: async (query: string): Promise<PlaceRecommendationResponse> => {
    const response = await apiClient.get<PlaceRecommendationResponse>(
      ENDPOINTS.MENU.RECOMMEND_PLACES,
      {
        params: { query },
      }
    );
    return response.data;
  },
  getRestaurantBlogs: async (query: string): Promise<RestaurantBlogsResponse> => {
    const response = await apiClient.get<RestaurantBlogsResponse>(
      ENDPOINTS.MENU.RESTAURANT_BLOGS,
      {
        params: { query },
      }
    );
    return response.data;
  },
  getPlaceRecommendationsByHistoryId: async (id: number): Promise<PlaceHistoryResponse> => {
    const response = await apiClient.get<PlaceHistoryResponse>(
      ENDPOINTS.MENU.RECOMMENDATION_DETAIL(id)
    );
    return response.data;
  },
  getPlaceDetail: async (placeId: string): Promise<PlaceDetailResponse> => {
    const response = await apiClient.get<PlaceDetailResponse>(
      ENDPOINTS.MENU.PLACE_DETAIL(placeId)
    );
    return response.data;
  },
};

