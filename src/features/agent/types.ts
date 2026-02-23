/**
 * 메뉴 관련 타입 정의
 */

export interface MenuRecommendationRequest {
  prompt: string;
}

/**
 * 조건 + 메뉴 아이템
 */
export interface MenuRecommendationItemData {
  condition: string;  // "~하다면" 형태의 조건
  menu: string;       // 메뉴명
}

/**
 * 메뉴 추천 API 응답
 */
export interface MenuRecommendationResponse {
  id: number; // 메뉴 추천 이력 ID (AI 가게 추천 시 historyId로 사용)
  intro: string;                              // 첫 설명
  recommendations: MenuRecommendationItemData[];  // 조건 + 메뉴 배열
  closing: string;                            // 마무리 말
  recommendedAt: string;
  requestAddress: string | null;
  // requestLocation 제거됨 (서버에서 더 이상 제공하지 않음)
}

export interface PlaceRecommendationItem {
  placeId: string;
  name: string;
  reason: string;
  menuName?: string;
  source?: 'GOOGLE' | 'USER' | 'GEMINI'; // 추천 소스 (구글 검색 / 유저 등록 가게 / Gemini AI)
  userPlaceId?: number; // UserPlace ID (source가 USER일 때만 존재)
  reasonTags?: string[];
  // Multilingual support
  localizedName?: string; // UI 표시용 (사용자 언어)
  localizedAddress?: string; // UI 표시용 (사용자 언어)
  searchName?: string; // 블로그 검색용 (현지 언어)
  searchAddress?: string; // 블로그 검색용 (현지 언어)
}

export interface PlaceRecommendationResponse {
  recommendations: PlaceRecommendationItem[];
}

// V2 place recommendation types with extended fields
export interface PlaceRecommendationItemV2 extends PlaceRecommendationItem {
  rating?: number;
  reviewCount?: number;
  isOpen?: boolean;
  openingHours?: string;
  address?: string;
  location?: { latitude: number; longitude: number };
  photoUrl?: string;
}

export interface PlaceRecommendationV2Response {
  recommendations: PlaceRecommendationItemV2[];
  searchEntryPointHtml?: string; // Google ToS requirement - search entry point HTML
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
  source?: 'GOOGLE' | 'USER';
  phoneNumber?: string | null;
  category?: string | null;
}

export interface PlaceHistoryMeta {
  id: number;
  type: 'MENU' | 'PLACE';
  prompt: string;
  intro: string;                                      // 첫 설명
  recommendations: MenuRecommendationItemData[];      // 조건 + 메뉴 배열
  closing: string;                                    // 마무리 말
  recommendedAt: string;
  requestAddress: string | null;
  // requestLocation 제거됨 (서버에서 더 이상 제공하지 않음)
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
  businessStatus?: string | null;
  photos: string[] | null;
  openNow: boolean | null;
  reviews: PlaceReview[] | null;
  source?: 'GOOGLE' | 'USER';
  phoneNumber?: string | null;
  openingHours?: string | null;
  menuTypes?: string[];
  category?: string | null;
  description?: string | null;
}

export interface PlaceDetailResponse {
  place: PlaceDetail;
}

// 메뉴 선택 관련
export type MenuSlot = 'breakfast' | 'lunch' | 'dinner' | 'etc';

export interface MenuPayload {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  etc: string[];
}

export interface MenuSelection {
  id: number;
  menuPayload: MenuPayload;
  selectedDate: string;
  historyId?: number | null;
}

export interface CreateMenuSelectionRequest {
  menus: { slot: MenuSlot; name: string }[];
  historyId?: number;
}

export interface CreateMenuSelectionResponse {
  selection: MenuSelection;
}

export interface GetMenuSelectionsResponse {
  selections: MenuSelection[];
}

export interface UpdateMenuSelectionRequest {
  breakfast?: string[];
  lunch?: string[];
  dinner?: string[];
  etc?: string[];
  cancel?: boolean;
}

export interface UpdateMenuSelectionResponse {
  selection: MenuSelection;
}
