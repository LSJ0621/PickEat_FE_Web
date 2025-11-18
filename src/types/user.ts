/**
 * 유저 관련 타입 정의
 */

export interface AddressSearchResult {
  address: string;
  roadAddress: string | null;
  postalCode: string | null;
  latitude: string;
  longitude: string;
}

export interface AddressSearchResponse {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
  addresses: AddressSearchResult[];
}

export interface SelectedAddress {
  address: string;
  roadAddress: string | null;
  postalCode: string | null;
  latitude: string;
  longitude: string;
}

export interface SetAddressRequest {
  selectedAddress: SelectedAddress;
}

export interface SetAddressResponse {
  address: string;
}

export interface Preferences {
  likes: string[];
  dislikes: string[];
}

export interface GetPreferencesResponse {
  preferences: Preferences;
}

export interface SetPreferencesRequest {
  likes?: string[];
  dislikes?: string[];
}

export interface RecommendationHistoryItem {
  id: number;
  recommendations: string[];
  prompt: string;
  recommendedAt: string;
}

export interface GetRecommendationHistoryResponse {
  history: RecommendationHistoryItem[];
}

