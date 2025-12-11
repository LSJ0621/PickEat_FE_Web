/**
 * 유저 관련 API 서비스
 */

import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { DeleteAccountResponse } from '@/types/auth';
import type {
    AddressSearchResponse,
    BatchDeleteAddressRequest,
    CreateAddressRequest,
    DeleteAddressResponse,
    GetAddressesResponse,
    GetDefaultAddressResponse,
    GetPreferencesResponse,
    GetRecommendationHistoryResponse,
    RecommendationHistoryItem,
    SelectedAddress,
    SetAddressResponse,
    SetPreferencesRequest,
    UpdateAddressRequest,
    UserAddress,
} from '@/types/user';

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
  getRecommendationHistory: async (
    options?: {
      date?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<GetRecommendationHistoryResponse> => {
    const params: Record<string, string | number> = {};
    
    if (options?.date) {
      params.date = options.date;
    }
    if (options?.page !== undefined) {
      params.page = options.page;
    }
    if (options?.limit !== undefined) {
      params.limit = options.limit;
    }

    const response = await apiClient.get<GetRecommendationHistoryResponse>(
      ENDPOINTS.RECOMMENDATION_HISTORY,
      { params: Object.keys(params).length > 0 ? params : undefined }
    );

    // hasPlaceRecommendations 필드가 서버에서 다른 이름으로 올 수 있으므로 정규화
    const normalizedHistory: RecommendationHistoryItem[] = response.data.items.map(
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

    return { items: normalizedHistory, pageInfo: response.data.pageInfo };
  },

  // 회원 탈퇴
  deleteAccount: async (): Promise<DeleteAccountResponse> => {
    const response = await apiClient.delete<DeleteAccountResponse>(
      ENDPOINTS.USER.DELETE
    );
    return response.data;
  },

  // 주소 리스트 조회
  getAddresses: async (): Promise<GetAddressesResponse> => {
    const response = await apiClient.get<UserAddress[] | GetAddressesResponse>(
      ENDPOINTS.USER.ADDRESSES
    );
    // 서버가 배열을 직접 반환하는 경우와 객체로 감싸서 반환하는 경우 모두 처리
    const data = response.data;
    if (Array.isArray(data)) {
      return { addresses: data };
    }
    return data as GetAddressesResponse;
  },

  // 기본 주소 조회
  getDefaultAddress: async (): Promise<GetDefaultAddressResponse> => {
    const response = await apiClient.get<GetDefaultAddressResponse>(
      ENDPOINTS.USER.ADDRESS_DEFAULT
    );
    return response.data;
  },

  // 주소 추가
  createAddress: async (data: CreateAddressRequest): Promise<UserAddress> => {
    const response = await apiClient.post<UserAddress>(
      ENDPOINTS.USER.ADDRESSES,
      data
    );
    return response.data;
  },

  // 주소 수정
  updateAddress: async (id: number, data: UpdateAddressRequest): Promise<UserAddress> => {
    const response = await apiClient.patch<UserAddress>(
      ENDPOINTS.USER.ADDRESS_BY_ID(id),
      data
    );
    return response.data;
  },

  // 주소 삭제 (배열로 여러 개 삭제)
  deleteAddresses: async (ids: number[]): Promise<DeleteAddressResponse> => {
    const response = await apiClient.delete<DeleteAddressResponse>(
      ENDPOINTS.USER.ADDRESSES,
      { 
        data: { ids } satisfies BatchDeleteAddressRequest
      }
    );
    return response.data;
  },

  // 기본 주소 설정
  setDefaultAddress: async (id: number): Promise<UserAddress> => {
    const response = await apiClient.patch<UserAddress>(
      ENDPOINTS.USER.ADDRESS_SET_DEFAULT(id)
    );
    return response.data;
  },

  // 검색 주소 설정
  setSearchAddress: async (id: number): Promise<UserAddress> => {
    const response = await apiClient.patch<UserAddress>(
      ENDPOINTS.USER.ADDRESS_SET_SEARCH(id)
    );
    return response.data;
  },
};

