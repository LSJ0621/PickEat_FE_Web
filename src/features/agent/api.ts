/**
 * 메뉴 관련 API 서비스
 */

import apiClient, { API_BASE_URL } from '@shared/api/client';
import { ENDPOINTS } from '@shared/api/endpoints';
import { STORAGE_KEYS } from '@shared/utils/constants';
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
} from './types';

// SSE Streaming Types
export type StreamEventType = 'status' | 'retrying' | 'result' | 'error';

export interface StreamEvent<T = unknown> {
  type: StreamEventType;
  status?: string;
  attempt?: number;
  data?: T;
  message?: string;
}

interface StreamCallbacks<T> {
  onEvent: (event: StreamEvent<T>) => void;
}

/**
 * Helper to construct headers for streaming requests
 */
function getStreamHeaders(method: 'GET' | 'POST'): HeadersInit {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const currentLang = localStorage.getItem('i18nextLng') || 'ko';
  return {
    'Accept': 'text/event-stream',
    ...(method === 'POST' && { 'Content-Type': 'application/json' }),
    'Accept-Language': currentLang,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Parse SSE stream from ReadableStream
 */
async function parseSSEStream<T>(
  response: Response,
  callbacks: StreamCallbacks<T>
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          try {
            const event = JSON.parse(dataStr) as StreamEvent<T>;
            callbacks.onEvent(event);
          } catch (parseError) {
            callbacks.onEvent({
              type: 'error',
              message: 'Failed to parse SSE event'
            } as StreamEvent<T>);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

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

  /**
   * Menu recommendation with SSE streaming
   */
  recommendStream: async (
    prompt: string,
    callbacks: StreamCallbacks<MenuRecommendationResponse>
  ): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MENU.RECOMMEND_STREAM}`, {
      method: 'POST',
      headers: getStreamHeaders('POST'),
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await parseSSEStream(response, callbacks);
  },

  /**
   * Search-based place recommendations with SSE streaming
   */
  recommendSearchPlacesStream: async (
    params: {
      latitude: number;
      longitude: number;
      menuName: string;
      menuRecommendationId: number;
      language?: string;
    },
    callbacks: StreamCallbacks<PlaceRecommendationResponse>
  ): Promise<void> => {
    const queryParams = new URLSearchParams({
      latitude: params.latitude.toString(),
      longitude: params.longitude.toString(),
      menuName: params.menuName,
      menuRecommendationId: params.menuRecommendationId.toString(),
      ...(params.language && { language: params.language }),
    });

    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.MENU.PLACES_SEARCH_STREAM}?${queryParams}`,
      {
        method: 'GET',
        headers: getStreamHeaders('GET'),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await parseSSEStream(response, callbacks);
  },

  /**
   * Community-based place recommendations with SSE streaming
   */
  recommendCommunityPlacesStream: async (
    params: {
      latitude: number;
      longitude: number;
      menuName: string;
      menuRecommendationId: number;
      language?: string;
    },
    callbacks: StreamCallbacks<PlaceRecommendationResponse>
  ): Promise<void> => {
    const queryParams = new URLSearchParams({
      latitude: params.latitude.toString(),
      longitude: params.longitude.toString(),
      menuName: params.menuName,
      menuRecommendationId: params.menuRecommendationId.toString(),
      ...(params.language && { language: params.language }),
    });

    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.MENU.PLACES_COMMUNITY_STREAM}?${queryParams}`,
      {
        method: 'GET',
        headers: getStreamHeaders('GET'),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await parseSSEStream(response, callbacks);
  },
};
