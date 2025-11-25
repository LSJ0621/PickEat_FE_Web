/**
 * 유저 관련 API 서비스
 */

import type {
  AddressSearchResponse,
  GetPreferencesResponse,
  GetRecommendationHistoryResponse,
  RecommendationHistoryItem,
  SelectedAddress,
  SetAddressResponse,
  SetPreferencesRequest,
} from '../../types/user';
import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export const userService = {
  // 주소 검색
  searchAddress: async (query: string): Promise<AddressSearchResponse> => {
    const response = await apiClient.get<AddressSearchResponse>(
      ENDPOINTS.USER.ADDRESS_SEARCH,
      { params: { query } }
    );
    return response.data;
  },

  // 주소 설정
  setAddress: async (selectedAddress: SelectedAddress): Promise<SetAddressResponse> => {
    const response = await apiClient.patch<SetAddressResponse>(
      ENDPOINTS.USER.ADDRESS_SET,
      { selectedAddress }
    );
    return response.data;
  },

  // 취향 정보 조회
  getPreferences: async (): Promise<GetPreferencesResponse> => {
    const response = await apiClient.get<GetPreferencesResponse>(
      ENDPOINTS.USER.PREFERENCES
    );
    return response.data;
  },

  // 취향 정보 설정
  setPreferences: async (data: SetPreferencesRequest): Promise<GetPreferencesResponse> => {
    const response = await apiClient.post<GetPreferencesResponse>(
      ENDPOINTS.USER.PREFERENCES,
      data
    );
    return response.data;
  },

  // 추천 이력 조회
  getRecommendationHistory: async (date?: string): Promise<GetRecommendationHistoryResponse> => {
    const response = await apiClient.get<GetRecommendationHistoryResponse>(
      ENDPOINTS.RECOMMENDATION_HISTORY,
      { params: date ? { date } : undefined }
    );

    // hasPlaceRecommendations 필드가 서버에서 다른 이름으로 올 수 있으므로 정규화
    const normalizedHistory: RecommendationHistoryItem[] = response.data.history.map(
      (item: RecommendationHistoryItem & { hasPlaceRecommendation?: boolean; has_place_recommendations?: boolean }) => {
        let hasPlaceRecommendations = item.hasPlaceRecommendations;

        if (typeof hasPlaceRecommendations !== 'boolean') {
          if (typeof item.hasPlaceRecommendation === 'boolean') {
            hasPlaceRecommendations = item.hasPlaceRecommendation;
          } else if (typeof item.has_place_recommendations === 'boolean') {
            hasPlaceRecommendations = item.has_place_recommendations;
          } else {
            hasPlaceRecommendations = false;
          }
        }

        return {
          ...item,
          hasPlaceRecommendations,
        };
      }
    );

    return { history: normalizedHistory };
  },
};

