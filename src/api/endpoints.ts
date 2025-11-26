/**
 * API 엔드포인트 관리
 * 모든 API 엔드포인트를 한 곳에서 관리하여 유지보수성을 높입니다.
 */

const API_BASE = '';

export const ENDPOINTS = {
  // 인증 관련
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    REGISTER: `${API_BASE}/auth/register`,
    LOGOUT: `${API_BASE}/auth/logout`,
    REFRESH: `${API_BASE}/auth/refresh`,
    ME: `${API_BASE}/auth/me`,
    CHECK_EMAIL: `${API_BASE}/auth/check-email`,
    KAKAO_LOGIN: `${API_BASE}/auth/kakao/doLogin`,
    GOOGLE_LOGIN: `${API_BASE}/auth/google/doLogin`,
    EMAIL_SEND_CODE: `${API_BASE}/auth/email/send-code`,
    EMAIL_VERIFY_CODE: `${API_BASE}/auth/email/verify-code`,
  },
  
  // 메뉴 관련
  MENU: {
    LIST: `${API_BASE}/menu`,
    DETAIL: (id: string) => `${API_BASE}/menu/${id}`,
    SEARCH: `${API_BASE}/menu/search`,
    RECOMMEND: `${API_BASE}/menu/recommend`,
    RECOMMEND_PLACES: `${API_BASE}/menu/recommend/places`,
    RESTAURANT_BLOGS: `${API_BASE}/menu/restaurant/blogs`,
    RECOMMENDATION_DETAIL: (id: number | string) => `${API_BASE}/menu/recommendations/${id}`,
    PLACE_DETAIL: (placeId: string) => `${API_BASE}/menu/places/${placeId}/detail`,
    GOOGLE_PLACES_SEARCH: `${API_BASE}/menu/google-places/search`,
  },
  
  // 검색 관련
  SEARCH: {
    RESTAURANTS: `${API_BASE}/search/restaurants`,
  },
  
  // 주문 관련
  ORDER: {
    CREATE: `${API_BASE}/order`,
    LIST: `${API_BASE}/order`,
    DETAIL: (id: string) => `${API_BASE}/order/${id}`,
    CANCEL: (id: string) => `${API_BASE}/order/${id}/cancel`,
  },
  
  // 장바구니 관련
  CART: {
    GET: `${API_BASE}/cart`,
    ADD: `${API_BASE}/cart`,
    UPDATE: (id: string) => `${API_BASE}/cart/${id}`,
    DELETE: (id: string) => `${API_BASE}/cart/${id}`,
    CLEAR: `${API_BASE}/cart/clear`,
  },
  
  // 유저 관련
  USER: {
    UPDATE: `${API_BASE}/user`,
    ADDRESS_SEARCH: `${API_BASE}/user/address/search`,
    ADDRESS_SET: `${API_BASE}/user/address`,
    PREFERENCES: `${API_BASE}/user/preferences`,
  },
  
  // 추천 이력 관련
  RECOMMENDATION_HISTORY: `${API_BASE}/menu/recommendations/history`,
} as const;
