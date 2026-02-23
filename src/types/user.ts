/**
 * 유저 관련 타입 정의
 */

import type { MenuRecommendationItemData } from '@/types/menu';

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
  id: number;
  roadAddress: string;
  postalCode: string | null;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  isSearchAddress: boolean;
  alias: string | null;
  createdAt: string; // ISO 8601 string (API 응답에서 Date는 string으로 직렬화됨)
  updatedAt: string; // ISO 8601 string (API 응답에서 Date는 string으로 직렬화됨)
}

export interface AnalysisParagraphs {
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
}

export interface Preferences {
  likes: string[];
  dislikes: string[];
  analysis?: string | null;
  analysisParagraphs?: AnalysisParagraphs | null;
}

export interface GetPreferencesResponse {
  preferences: Preferences;
}

export interface SetPreferencesRequest {
  likes?: string[];
  dislikes?: string[];
}

export interface RecommendationLocation {
  lat: number;
  lng: number;
}

export interface RecommendationHistoryItem {
  id: number;
  recommendations: MenuRecommendationItemData[];
  prompt: string;
  reason: string;
  recommendedAt: string;
  requestAddress: string | null;
  // requestLocation 제거됨 (서버에서 더 이상 제공하지 않음)
  hasPlaceRecommendations: boolean;
}

export interface PageInfo {
  page: number;
  limit: number;
  totalCount: number;
  hasNext: boolean;
}

export interface GetRecommendationHistoryResponse {
  items: RecommendationHistoryItem[];
  pageInfo: PageInfo;
}

// 주소 리스트 관련 타입
export interface UserAddress {
  id: number;
  roadAddress: string;
  postalCode: string | null;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  isSearchAddress: boolean;
  alias: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetAddressesResponse {
  addresses: UserAddress[];
}

export interface GetDefaultAddressResponse {
  address: UserAddress | null;
}

export interface CreateAddressRequest {
  selectedAddress: SelectedAddress;
  alias?: string;
  isDefault?: boolean;
  isSearchAddress?: boolean;
}

export interface UpdateAddressRequest {
  roadAddress?: string;
  latitude?: number;
  longitude?: number;
  alias?: string;
  isDefault?: boolean;
  isSearchAddress?: boolean;
}

export interface DeleteAddressResponse {
  message: string;
}

export interface BatchDeleteAddressRequest {
  ids: number[];
}

export interface DeleteAccountResponse {
  message: string;
}

