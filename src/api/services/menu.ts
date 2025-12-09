/**
 * 메뉴 관련 API 서비스
 */

import type {
    CreateMenuSelectionRequest,
    CreateMenuSelectionResponse,
    GetMenuSelectionsResponse,
    MenuRecommendationResponse,
    PlaceDetailResponse,
    PlaceHistoryResponse,
    PlaceRecommendationResponse,
    RestaurantBlogsResponse,
    UpdateMenuSelectionRequest,
    UpdateMenuSelectionResponse,
} from '@/types/menu';
import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

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
  recommendPlaces: async (params: { query: string; historyId: number; menuName: string }): Promise<PlaceRecommendationResponse> => {
    const response = await apiClient.get<PlaceRecommendationResponse>(ENDPOINTS.MENU.RECOMMEND_PLACES, {
      params,
    });
    return response.data;
  },
  getRestaurantBlogs: async (query: string, restaurantName?: string): Promise<RestaurantBlogsResponse> => {
    const response = await apiClient.get<RestaurantBlogsResponse>(
      ENDPOINTS.MENU.RESTAURANT_BLOGS,
      {
        params: {
          query,
          ...(restaurantName && { restaurantName }),
        },
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
  // 메뉴 선택 관련
  createMenuSelection: async (data: CreateMenuSelectionRequest): Promise<CreateMenuSelectionResponse> => {
    const response = await apiClient.post<CreateMenuSelectionResponse>(
      ENDPOINTS.MENU.SELECTIONS,
      data
    );
    return response.data;
  },
  getMenuSelections: async (date?: string): Promise<GetMenuSelectionsResponse> => {
    const response = await apiClient.get<GetMenuSelectionsResponse>(
      ENDPOINTS.MENU.SELECTIONS_HISTORY,
      { params: date ? { date } : undefined }
    );
    return response.data;
  },
  updateMenuSelection: async (
    selectionId: number,
    data: UpdateMenuSelectionRequest
  ): Promise<UpdateMenuSelectionResponse> => {
    const url = ENDPOINTS.MENU.SELECTION_UPDATE(selectionId);
    const response = await apiClient.patch<UpdateMenuSelectionResponse>(url, data);
    return response.data;
  },
};
