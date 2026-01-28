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
    RE_REGISTER: `${API_BASE}/auth/re-register`,
    RE_REGISTER_SOCIAL: `${API_BASE}/auth/re-register/social`,
    LOGOUT: `${API_BASE}/auth/logout`,
    REFRESH: `${API_BASE}/auth/refresh`,
    ME: `${API_BASE}/auth/me`,
    CHECK_EMAIL: `${API_BASE}/auth/check-email`,
    KAKAO_LOGIN: `${API_BASE}/auth/kakao/doLogin`,
    GOOGLE_LOGIN: `${API_BASE}/auth/google/doLogin`,
    EMAIL_SEND_CODE: `${API_BASE}/auth/email/send-code`,
    EMAIL_VERIFY_CODE: `${API_BASE}/auth/email/verify-code`,
    PASSWORD_RESET_SEND_CODE: `${API_BASE}/auth/password/reset/send-code`,
    PASSWORD_RESET_VERIFY_CODE: `${API_BASE}/auth/password/reset/verify-code`,
    PASSWORD_RESET: `${API_BASE}/auth/password/reset`,
  },
  
  // 메뉴 관련
  MENU: {
    RECOMMEND: `${API_BASE}/menu/recommend`,
    RECOMMEND_PLACES: `${API_BASE}/menu/recommend/places`,
    RECOMMEND_PLACES_SEARCH: `${API_BASE}/menu/recommend/places/search`,
    RECOMMEND_PLACES_COMMUNITY: `${API_BASE}/menu/recommend/places/community`,
    RESTAURANT_BLOGS: `${API_BASE}/menu/restaurant/blogs`,
    RECOMMENDATION_DETAIL: (id: number | string) => `${API_BASE}/menu/recommendations/${id}`,
    PLACE_DETAIL: (placeId: string) => `${API_BASE}/menu/places/${placeId}/detail`,
    SELECTIONS: `${API_BASE}/menu/selections`,
    SELECTIONS_HISTORY: `${API_BASE}/menu/selections/history`,
    SELECTION_UPDATE: (id: number) => `${API_BASE}/menu/selections/${id}`,
  },
  
  // 검색 관련
  SEARCH: {
    RESTAURANTS: `${API_BASE}/search/restaurants`,
  },
  
  // 유저 관련
  USER: {
    UPDATE: `${API_BASE}/user`,
    DELETE: `${API_BASE}/user/me`,
    ADDRESS_SEARCH: `${API_BASE}/user/address/search`,
    ADDRESS_SET: `${API_BASE}/user/address`,
    ADDRESSES: `${API_BASE}/user/addresses`,
    ADDRESS_DEFAULT: `${API_BASE}/user/address/default`,
    ADDRESS_BY_ID: (id: number) => `${API_BASE}/user/addresses/${id}`,
    ADDRESS_SET_DEFAULT: (id: number) => `${API_BASE}/user/addresses/${id}/default`,
    ADDRESS_SET_SEARCH: (id: number) => `${API_BASE}/user/addresses/${id}/search`,
    PREFERENCES: `${API_BASE}/user/preferences`,
    LANGUAGE: `${API_BASE}/user/language`,
  },
  
  // 추천 이력 관련
  RECOMMENDATION_HISTORY: `${API_BASE}/menu/recommendations/history`,
  
  // 버그 리포트 관련
  BUG_REPORT: {
    CREATE: `${API_BASE}/bug-reports`,
  },
  
  // 관리자 관련
  ADMIN: {
    BUG_REPORTS: `${API_BASE}/admin/bug-reports`,
    BUG_REPORT_DETAIL: (id: number | string) => `${API_BASE}/admin/bug-reports/${id}`,
    BUG_REPORT_UPDATE_STATUS: (id: number | string) => `${API_BASE}/admin/bug-reports/${id}/status`,
    DASHBOARD: {
      SUMMARY: `${API_BASE}/admin/dashboard/summary`,
      RECENT_ACTIVITIES: `${API_BASE}/admin/dashboard/recent-activities`,
      TRENDS: `${API_BASE}/admin/dashboard/trends`,
    },
    USERS: `${API_BASE}/admin/users`,
    USER_DETAIL: (id: number) => `${API_BASE}/admin/users/${id}`,
    USER_DEACTIVATE: (id: number) => `${API_BASE}/admin/users/${id}/deactivate`,
    USER_ACTIVATE: (id: number) => `${API_BASE}/admin/users/${id}/activate`,
    USER_PLACES: `${API_BASE}/admin/user-places`,
    USER_PLACE_DETAIL: (id: number) => `${API_BASE}/admin/user-places/${id}`,
    USER_PLACE_APPROVE: (id: number) => `${API_BASE}/admin/user-places/${id}/approve`,
    USER_PLACE_REJECT: (id: number) => `${API_BASE}/admin/user-places/${id}/reject`,
    USER_PLACE_UPDATE: (id: number) => `${API_BASE}/admin/user-places/${id}`,
    SETTINGS: {
      ADMINS: `${API_BASE}/admin/settings/admins`,
      ADMIN_DETAIL: (id: number | string) => `${API_BASE}/admin/settings/admins/${id}`,
    },
  },

  // 유저 맛집 관련
  USER_PLACE: {
    CHECK: `${API_BASE}/user-places/check`,
    LIST: `${API_BASE}/user-places`,
    CREATE: `${API_BASE}/user-places`,
    DETAIL: (id: number) => `${API_BASE}/user-places/${id}`,
    UPDATE: (id: number) => `${API_BASE}/user-places/${id}`,
    DELETE: (id: number) => `${API_BASE}/user-places/${id}`,
  },
} as const;
