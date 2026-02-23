/**
 * 라우트 경로 상수
 * 하드코딩된 경로 문자열 대신 이 상수를 사용하세요.
 */

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  RE_REGISTER: '/re-register',
  PASSWORD_RESET_REQUEST: '/password/reset/request',
  PASSWORD_RESET: '/password/reset',

  MYPAGE: '/mypage',
  MYPAGE_PROFILE: '/mypage/profile',
  MYPAGE_PREFERENCES: '/mypage/preferences',
  MYPAGE_ADDRESS: '/mypage/address',

  AGENT: '/agent',
  MAP: '/map',
  BUG_REPORT: '/bug-report',

  RECOMMENDATIONS_HISTORY: '/recommendations/history',
  MENU_SELECTIONS_HISTORY: '/menu-selections/history',
  RATINGS_HISTORY: '/ratings/history',

  USER_PLACES: '/user-places',
  USER_PLACES_CREATE: '/user-places/create',
  USER_PLACES_EDIT: (id: string | number) => `/user-places/${id}/edit`,

  OAUTH_KAKAO_REDIRECT: '/oauth/kakao/redirect',
  OAUTH_GOOGLE_REDIRECT: '/oauth/google/redirect',

  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAIL: (id: string | number) => `/admin/users/${id}`,
  ADMIN_USER_PLACES: '/admin/user-places',
  ADMIN_BUG_REPORTS: '/admin/bug-reports',
  ADMIN_BUG_REPORT_DETAIL: (id: string | number) => `/admin/bug-reports/${id}`,
  ADMIN_SETTINGS: '/admin/settings',
} as const;
