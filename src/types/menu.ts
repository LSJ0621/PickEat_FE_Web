/**
 * 메뉴 관련 타입 정의
 */

export interface MenuRecommendationRequest {
  prompt: string;
}

export interface MenuRecommendationResponse {
  id: number; // 메뉴 추천 이력 ID (AI 가게 추천 시 historyId로 사용)
  recommendations: string[];
  recommendedAt: string;
  requestAddress: string | null;
  requestLocation: { lat: number; lng: number } | null;
}

export interface PlaceRecommendationItem {
  placeId: string;
  name: string;
  reason: string;
  menuName?: string;
}

export interface PlaceRecommendationResponse {
  recommendations: PlaceRecommendationItem[];
}

export interface RestaurantBlog {
  title: string | null;
  url: string | null;
  snippet: string | null;
  thumbnailUrl: string | null;
  source: string | null;
}

export interface RestaurantBlogsResponse {
  blogs: RestaurantBlog[];
}

export interface PlaceLocation {
  latitude: number;
  longitude: number;
}

export interface PlaceReview {
  rating: number | null;
  text: string | null;
  authorName: string | null;
  publishTime: string | null;
}

// /menu/recommendations/:id → places 배열 항목
export interface PlaceHistoryPlace {
  menuName: string;
  placeId: string;
  reason: string | null;
  name: string | null;
  address: string | null;
  rating: number | null;
  userRatingCount: number | null;
  priceLevel: string | null;
  photos: string[] | null;
  openNow: boolean | null;
  reviews: PlaceReview[] | null;
}

export interface PlaceHistoryMeta {
  id: number;
  type: 'MENU' | 'PLACE';
  prompt: string;
  recommendedAt: string;
  requestAddress: string | null;
  requestLocation: { lat: number; lng: number } | null;
  hasPlaceRecommendations: boolean;
}

export interface PlaceHistoryResponse {
  history: PlaceHistoryMeta;
  places: PlaceHistoryPlace[];
}

// /menu/places/:placeId/detail → place 객체
export interface PlaceDetail {
  id: string;
  name: string | null;
  address: string | null;
  location: PlaceLocation | null;
  rating: number | null;
  userRatingCount: number | null;
  priceLevel: string | null;
  photos: string[] | null;
  openNow: boolean | null;
  reviews: PlaceReview[] | null;
}

export interface PlaceDetailResponse {
  place: PlaceDetail;
}
