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

export type RecommendationHistoryType = 'MENU' | 'PLACE';

export interface RecommendationLocation {
  lat: number;
  lng: number;
}

export interface RecommendationHistoryItem {
  id: number;
  type: RecommendationHistoryType;
  recommendations: string[]; // type === 'MENU'일 때만 의미 있음
  prompt: string;
  recommendedAt: string;
  requestAddress: string | null;
  requestLocation: RecommendationLocation | null;
  hasPlaceRecommendations: boolean;
}

export interface GetRecommendationHistoryResponse {
  history: RecommendationHistoryItem[];
}

