/**
 * 상수 관리
 * 하드코딩된 값들을 상수로 관리하여 유지보수성을 높입니다.
 */

import i18n from '@/i18n/config';

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

// 에러 메시지 (i18n 키 기반)
export const ERROR_MESSAGES = {
  get REQUIRED() {
    return i18n.t('validation.required');
  },
  get INVALID_EMAIL() {
    return i18n.t('validation.email.invalid');
  },
  get PASSWORD_TOO_SHORT() {
    return i18n.t('validation.password.tooShort', { minLength: VALIDATION.PASSWORD_MIN_LENGTH });
  },
  get PASSWORD_MISMATCH() {
    return i18n.t('validation.password.mismatch');
  },
  get NETWORK_ERROR() {
    return i18n.t('errors.NETWORK_ERROR');
  },
  get UNAUTHORIZED() {
    return i18n.t('errors.AUTH_INVALID_CREDENTIALS');
  },
  // 입력 필수 메시지
  get NAME_REQUIRED() {
    return i18n.t('validation.name.required');
  },
  get EMAIL_REQUIRED() {
    return i18n.t('validation.email.required');
  },
  get PASSWORD_REQUIRED() {
    return i18n.t('validation.password.required');
  },
  get CONFIRM_PASSWORD_REQUIRED() {
    return i18n.t('validation.password.confirmRequired');
  },
  get EMAIL_AND_PASSWORD_REQUIRED() {
    return i18n.t('validation.password.emailAndPasswordRequired');
  },
  get VERIFICATION_CODE_REQUIRED() {
    return i18n.t('validation.verificationCode.required');
  },
  // 이메일 인증 관련 메시지
  get EMAIL_DUPLICATE_CHECK_REQUIRED() {
    return i18n.t('validation.email.duplicateCheckRequired');
  },
  get EMAIL_VERIFICATION_REQUIRED() {
    return i18n.t('validation.email.verificationRequired');
  },
} as const;

// 성공 메시지 (i18n 키 기반)
export const SUCCESS_MESSAGES = {
  get LOGIN() {
    return i18n.t('success.login');
  },
  get LOGOUT() {
    return i18n.t('success.logout');
  },
  get REGISTER() {
    return i18n.t('success.register');
  },
  get ORDER_CREATED() {
    return i18n.t('success.orderCreated');
  },
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
  CATEGORY_KEYS: ['bug', 'inquiry', 'other'] as const,
} as const;

// User Place 관련
export const USER_PLACE = {
  MAX_IMAGES: 5,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
} as const;

// Z-Index 체계
export const Z_INDEX = {
  HEADER: 30,
  FOOTER: 30,
  DROPDOWN: 50,
  MODAL_BACKDROP: 100,
  MODAL_CONTENT: 101,
  PRIORITY_MODAL: 200,
  TOAST: 300,
} as const;

