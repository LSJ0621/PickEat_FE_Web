/**
 * 상수 관리
 * 하드코딩된 값들을 상수로 관리하여 유지보수성을 높입니다.
 */

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
} as const;

// API 관련
export const API_CONFIG = {
  TIMEOUT: 10000,
  MAX_RETRY: 3,
} as const;

// 페이지네이션
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// 유효성 검사 규칙
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  PHONE_REGEX: /^[0-9]{10,11}$/,
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  REQUIRED: '필수 입력 항목입니다.',
  INVALID_EMAIL: '올바른 이메일 형식이 아닙니다.',
  PASSWORD_TOO_SHORT: `비밀번호는 ${VALIDATION.PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`,
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  UNAUTHORIZED: '인증이 필요합니다.',
} as const;

// 성공 메시지
export const SUCCESS_MESSAGES = {
  LOGIN: '로그인되었습니다.',
  LOGOUT: '로그아웃되었습니다.',
  REGISTER: '회원가입이 완료되었습니다.',
  ORDER_CREATED: '주문이 완료되었습니다.',
} as const;

