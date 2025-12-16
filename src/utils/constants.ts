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
  PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  UNAUTHORIZED: '인증이 필요합니다.',
  // 입력 필수 메시지
  NAME_REQUIRED: '이름을 입력해주세요.',
  EMAIL_REQUIRED: '이메일을 입력해주세요.',
  PASSWORD_REQUIRED: '비밀번호를 입력해주세요.',
  CONFIRM_PASSWORD_REQUIRED: '비밀번호 확인을 입력해주세요.',
  EMAIL_AND_PASSWORD_REQUIRED: '이메일과 비밀번호를 입력해주세요.',
  VERIFICATION_CODE_REQUIRED: '인증 코드를 입력해주세요.',
  // 이메일 인증 관련 메시지
  EMAIL_DUPLICATE_CHECK_REQUIRED: '이메일 중복 확인을 해주세요.',
  EMAIL_VERIFICATION_REQUIRED: '이메일 인증을 완료해주세요.',
} as const;

// 성공 메시지
export const SUCCESS_MESSAGES = {
  LOGIN: '로그인되었습니다.',
  LOGOUT: '로그아웃되었습니다.',
  REGISTER: '회원가입이 완료되었습니다.',
  ORDER_CREATED: '주문이 완료되었습니다.',
} as const;

// 지도 관련 상수
export const MAP_CONFIG = {
  ZOOM: {
    DEFAULT: 15,
    SINGLE_MARKER: 16,
    MULTIPLE_MARKERS_SMALL: 14,
    MULTIPLE_MARKERS_LARGE: 15,
  },
  PADDING: {
    FIT_BOUNDS: 60,
  },
  TIMEOUT: {
    VIEWPORT_STABILIZE_SHORT: 50,
    VIEWPORT_STABILIZE_MEDIUM: 100,
    VIEWPORT_STABILIZE_LONG: 300,
    PHOTO_TRANSITION: 50,
  },
} as const;

// 버그 리포트 관련
export const BUG_REPORT = {
  MAX_IMAGES: 5,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  TITLE_MAX_LENGTH: 30,
  DESCRIPTION_MAX_LENGTH: 500,
  CATEGORIES: {
    BUG: '버그 제보',
    INQUIRY: '문의 사항',
    OTHER: '기타',
  } as const,
} as const;

