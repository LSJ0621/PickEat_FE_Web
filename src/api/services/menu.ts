/**
 * 메뉴 관련 API 서비스
 */

import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
    CreateMenuSelectionRequest,
    CreateMenuSelectionResponse,
    GetMenuSelectionsResponse,
    MenuRecommendationResponse,
    PlaceDetailResponse,
    PlaceHistoryResponse,
    PlaceRecommendationResponse,
    PlaceRecommendationV2Response,
    RestaurantBlogsResponse,
    UpdateMenuSelectionRequest,
    UpdateMenuSelectionResponse,
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
  recommendPlaces: async (params: { query: string; historyId: number; menuName: string }): Promise<PlaceRecommendationResponse> => {
    const response = await apiClient.get<PlaceRecommendationResponse>(ENDPOINTS.MENU.RECOMMEND_PLACES, {
      params,
    });
    return response.data;
  },
  /**
   * V2 가게 추천 (Gemini 기반, 확장된 정보 포함)
   * - rating, reviewCount, openingHours, address, location, photoUrl 포함
   * - searchEntryPointHtml: Google ToS 렌더링 필요
   */
  recommendPlacesV2: async (params: {
    menuName: string;
    address: string;
    latitude: number;
    longitude: number;
    menuRecommendationId: number;
    language?: 'ko' | 'en';
  }): Promise<PlaceRecommendationV2Response> => {
    const response = await apiClient.get<PlaceRecommendationV2Response>(ENDPOINTS.MENU.RECOMMEND_PLACES_V2, {
      params,
    });
    return response.data;
  },
  /**
   * 검색 기반 가게 추천 (Google Places)
   */
  recommendSearchPlaces: async (params: {
    latitude: number;
    longitude: number;
    menuName: string;
    menuRecommendationId: number;
    language?: string;
  }): Promise<PlaceRecommendationResponse> => {
    const response = await apiClient.get<PlaceRecommendationResponse>(
      ENDPOINTS.MENU.RECOMMEND_PLACES_SEARCH,
      { params }
    );
    return response.data;
  },
  /**
   * 커뮤니티 등록 가게 추천 (UserPlace)
   */
  recommendCommunityPlaces: async (params: {
    latitude: number;
    longitude: number;
    menuName: string;
    menuRecommendationId: number;
    language?: string;
  }): Promise<PlaceRecommendationResponse> => {
    const response = await apiClient.get<PlaceRecommendationResponse>(
      ENDPOINTS.MENU.RECOMMEND_PLACES_COMMUNITY,
      { params }
    );
    return response.data;
  },
  getRestaurantBlogs: async (
    query: string,
    restaurantName?: string,
    language?: 'ko' | 'en' | 'ja' | 'zh',
    searchName?: string,
    searchAddress?: string
  ): Promise<RestaurantBlogsResponse> => {
    const response = await apiClient.get<RestaurantBlogsResponse>(
      ENDPOINTS.MENU.RESTAURANT_BLOGS,
      {
        params: {
          query,
          ...(restaurantName && { restaurantName }),
          ...(language && { language }),
          ...(searchName && { searchName }),
          ...(searchAddress && { searchAddress }),
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
