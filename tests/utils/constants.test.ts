import { describe, it, expect } from 'vitest';
import {
  STORAGE_KEYS,
  API_CONFIG,
  PAGINATION,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  MAP_CONFIG,
  BUG_REPORT,
} from '@/utils/constants';

describe('STORAGE_KEYS', () => {
  it('should have correct storage key values', () => {
    expect(STORAGE_KEYS.TOKEN).toBe('token');
    expect(STORAGE_KEYS.REFRESH_TOKEN).toBe('refreshToken');
    expect(STORAGE_KEYS.USER).toBe('user');
    expect(STORAGE_KEYS.THEME).toBe('theme');
  });

  it('should be immutable (as const)', () => {
    expect(Object.isFrozen(STORAGE_KEYS)).toBe(false); // as const doesn't freeze at runtime
    expect(typeof STORAGE_KEYS).toBe('object');
  });

  it('should have all required keys', () => {
    expect(Object.keys(STORAGE_KEYS)).toEqual(['TOKEN', 'REFRESH_TOKEN', 'USER', 'THEME']);
  });
});

describe('API_CONFIG', () => {
  it('should have correct API configuration values', () => {
    expect(API_CONFIG.TIMEOUT).toBe(10000);
    expect(API_CONFIG.MAX_RETRY).toBe(3);
  });

  it('should have numeric values', () => {
    expect(typeof API_CONFIG.TIMEOUT).toBe('number');
    expect(typeof API_CONFIG.MAX_RETRY).toBe('number');
  });

  it('should have positive values', () => {
    expect(API_CONFIG.TIMEOUT).toBeGreaterThan(0);
    expect(API_CONFIG.MAX_RETRY).toBeGreaterThan(0);
  });
});

describe('PAGINATION', () => {
  it('should have correct pagination values', () => {
    expect(PAGINATION.DEFAULT_PAGE).toBe(1);
    expect(PAGINATION.DEFAULT_LIMIT).toBe(10);
    expect(PAGINATION.MAX_LIMIT).toBe(100);
  });

  it('should have logical pagination constraints', () => {
    expect(PAGINATION.DEFAULT_PAGE).toBeGreaterThanOrEqual(1);
    expect(PAGINATION.DEFAULT_LIMIT).toBeLessThanOrEqual(PAGINATION.MAX_LIMIT);
    expect(PAGINATION.MAX_LIMIT).toBeGreaterThan(PAGINATION.DEFAULT_LIMIT);
  });
});

describe('VALIDATION', () => {
  it('should have valid email regex', () => {
    expect(VALIDATION.EMAIL_REGEX.test('test@example.com')).toBe(true);
    expect(VALIDATION.EMAIL_REGEX.test('user.name@domain.co.kr')).toBe(true);
    expect(VALIDATION.EMAIL_REGEX.test('invalid-email')).toBe(false);
    expect(VALIDATION.EMAIL_REGEX.test('missing@domain')).toBe(false);
    expect(VALIDATION.EMAIL_REGEX.test('@domain.com')).toBe(false);
    expect(VALIDATION.EMAIL_REGEX.test('user@')).toBe(false);
  });

  it('should have valid phone regex', () => {
    expect(VALIDATION.PHONE_REGEX.test('01012345678')).toBe(true);
    expect(VALIDATION.PHONE_REGEX.test('0212345678')).toBe(true);
    expect(VALIDATION.PHONE_REGEX.test('123')).toBe(false);
    expect(VALIDATION.PHONE_REGEX.test('012-1234-5678')).toBe(false);
    expect(VALIDATION.PHONE_REGEX.test('abcdefghij')).toBe(false);
  });

  it('should have reasonable password minimum length', () => {
    expect(VALIDATION.PASSWORD_MIN_LENGTH).toBe(6);
    expect(VALIDATION.PASSWORD_MIN_LENGTH).toBeGreaterThan(0);
  });
});

describe('ERROR_MESSAGES', () => {
  it('should have all required error messages', () => {
    expect(ERROR_MESSAGES.REQUIRED).toBeDefined();
    expect(ERROR_MESSAGES.INVALID_EMAIL).toBeDefined();
    expect(ERROR_MESSAGES.PASSWORD_TOO_SHORT).toBeDefined();
    expect(ERROR_MESSAGES.PASSWORD_MISMATCH).toBeDefined();
    expect(ERROR_MESSAGES.NETWORK_ERROR).toBeDefined();
    expect(ERROR_MESSAGES.UNAUTHORIZED).toBeDefined();
  });

  it('should have input validation messages', () => {
    expect(ERROR_MESSAGES.NAME_REQUIRED).toBe('이름을 입력해주세요.');
    expect(ERROR_MESSAGES.EMAIL_REQUIRED).toBe('이메일을 입력해주세요.');
    expect(ERROR_MESSAGES.PASSWORD_REQUIRED).toBe('비밀번호를 입력해주세요.');
    expect(ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED).toBe('비밀번호 확인을 입력해주세요.');
  });

  it('should have email verification messages', () => {
    expect(ERROR_MESSAGES.EMAIL_DUPLICATE_CHECK_REQUIRED).toBe('이메일 중복 확인을 해주세요.');
    expect(ERROR_MESSAGES.EMAIL_VERIFICATION_REQUIRED).toBe('이메일 인증을 완료해주세요.');
    expect(ERROR_MESSAGES.VERIFICATION_CODE_REQUIRED).toBe('인증 코드를 입력해주세요.');
  });

  it('should include password length in password error message', () => {
    expect(ERROR_MESSAGES.PASSWORD_TOO_SHORT).toContain('6');
  });
});

describe('SUCCESS_MESSAGES', () => {
  it('should have all success messages', () => {
    expect(SUCCESS_MESSAGES.LOGIN).toBe('로그인되었습니다.');
    expect(SUCCESS_MESSAGES.LOGOUT).toBe('로그아웃되었습니다.');
    expect(SUCCESS_MESSAGES.REGISTER).toBe('회원가입이 완료되었습니다.');
    expect(SUCCESS_MESSAGES.ORDER_CREATED).toBe('주문이 완료되었습니다.');
  });

  it('should have non-empty messages', () => {
    Object.values(SUCCESS_MESSAGES).forEach((message) => {
      expect(message.length).toBeGreaterThan(0);
    });
  });
});

describe('MAP_CONFIG', () => {
  it('should have correct zoom levels', () => {
    expect(MAP_CONFIG.ZOOM.DEFAULT).toBe(15);
    expect(MAP_CONFIG.ZOOM.SINGLE_MARKER).toBe(16);
    expect(MAP_CONFIG.ZOOM.MULTIPLE_MARKERS_SMALL).toBe(14);
    expect(MAP_CONFIG.ZOOM.MULTIPLE_MARKERS_LARGE).toBe(15);
  });

  it('should have logical zoom hierarchy', () => {
    expect(MAP_CONFIG.ZOOM.SINGLE_MARKER).toBeGreaterThan(MAP_CONFIG.ZOOM.MULTIPLE_MARKERS_SMALL);
  });

  it('should have correct padding values', () => {
    expect(MAP_CONFIG.PADDING.FIT_BOUNDS).toBe(60);
    expect(MAP_CONFIG.PADDING.FIT_BOUNDS).toBeGreaterThan(0);
  });

  it('should have correct timeout values', () => {
    expect(MAP_CONFIG.TIMEOUT.VIEWPORT_STABILIZE_SHORT).toBe(50);
    expect(MAP_CONFIG.TIMEOUT.VIEWPORT_STABILIZE_MEDIUM).toBe(100);
    expect(MAP_CONFIG.TIMEOUT.VIEWPORT_STABILIZE_LONG).toBe(300);
    expect(MAP_CONFIG.TIMEOUT.PHOTO_TRANSITION).toBe(50);
  });

  it('should have ascending timeout values', () => {
    expect(MAP_CONFIG.TIMEOUT.VIEWPORT_STABILIZE_MEDIUM).toBeGreaterThan(
      MAP_CONFIG.TIMEOUT.VIEWPORT_STABILIZE_SHORT
    );
    expect(MAP_CONFIG.TIMEOUT.VIEWPORT_STABILIZE_LONG).toBeGreaterThan(
      MAP_CONFIG.TIMEOUT.VIEWPORT_STABILIZE_MEDIUM
    );
  });
});

describe('BUG_REPORT', () => {
  it('should have correct image constraints', () => {
    expect(BUG_REPORT.MAX_IMAGES).toBe(5);
    expect(BUG_REPORT.MAX_IMAGE_SIZE).toBe(5 * 1024 * 1024); // 5MB
  });

  it('should have valid allowed image types', () => {
    expect(BUG_REPORT.ALLOWED_IMAGE_TYPES).toContain('image/jpeg');
    expect(BUG_REPORT.ALLOWED_IMAGE_TYPES).toContain('image/jpg');
    expect(BUG_REPORT.ALLOWED_IMAGE_TYPES).toContain('image/png');
    expect(BUG_REPORT.ALLOWED_IMAGE_TYPES).toContain('image/gif');
    expect(BUG_REPORT.ALLOWED_IMAGE_TYPES).toContain('image/webp');
  });

  it('should have correct text length constraints', () => {
    expect(BUG_REPORT.TITLE_MAX_LENGTH).toBe(30);
    expect(BUG_REPORT.DESCRIPTION_MAX_LENGTH).toBe(500);
  });

  it('should have logical length hierarchy', () => {
    expect(BUG_REPORT.DESCRIPTION_MAX_LENGTH).toBeGreaterThan(BUG_REPORT.TITLE_MAX_LENGTH);
  });

  it('should have all category values', () => {
    expect(BUG_REPORT.CATEGORIES.BUG).toBe('버그 제보');
    expect(BUG_REPORT.CATEGORIES.INQUIRY).toBe('문의 사항');
    expect(BUG_REPORT.CATEGORIES.OTHER).toBe('기타');
  });

  it('should have non-empty category values', () => {
    Object.values(BUG_REPORT.CATEGORIES).forEach((category) => {
      expect(category.length).toBeGreaterThan(0);
    });
  });
});
