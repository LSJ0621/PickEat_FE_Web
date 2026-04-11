/**
 * validation 유틸리티 테스트
 * 이메일/비밀번호/전화번호/빈값 검증 동작 검증
 */

import {
  isValidEmail,
  isValidPassword,
  isPasswordMatch,
  isValidPhone,
  isEmpty,
  validateBugReport,
} from '@shared/utils/validation';
import type { CreateBugReportRequest } from '@features/bug-report/types';

describe('isValidEmail', () => {
  it('유효한 이메일 → true', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('서브도메인 포함 이메일 → true', () => {
    expect(isValidEmail('user@mail.example.com')).toBe(true);
  });

  it('@가 없으면 → false', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('도메인 없으면 → false', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('로컬 파트 없으면 → false', () => {
    expect(isValidEmail('@example.com')).toBe(false);
  });

  it('공백 포함 → false', () => {
    expect(isValidEmail('user @example.com')).toBe(false);
  });

  it('빈 문자열 → false', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('8자 이상 → true', () => {
    expect(isValidPassword('password1')).toBe(true);
  });

  it('정확히 8자 → true (하한 경계값)', () => {
    expect(isValidPassword('12345678')).toBe(true);
  });

  it('7자 → false (하한 경계값 아래)', () => {
    expect(isValidPassword('1234567')).toBe(false);
  });

  it('빈 문자열 → false', () => {
    expect(isValidPassword('')).toBe(false);
  });

  it('긴 비밀번호 → true', () => {
    expect(isValidPassword('a'.repeat(50))).toBe(true);
  });
});

describe('isPasswordMatch', () => {
  it('동일한 비밀번호 → true', () => {
    expect(isPasswordMatch('abc123!@', 'abc123!@')).toBe(true);
  });

  it('대소문자 다르면 → false', () => {
    expect(isPasswordMatch('abc123!@', 'ABC123!@')).toBe(false);
  });

  it('하나가 빈 문자열이면 → false', () => {
    expect(isPasswordMatch('abc123', '')).toBe(false);
  });

  it('둘 다 빈 문자열 → true (빈 값끼리는 일치)', () => {
    expect(isPasswordMatch('', '')).toBe(true);
  });
});

describe('isValidPhone', () => {
  it('11자리 번호 → true', () => {
    expect(isValidPhone('01012345678')).toBe(true);
  });

  it('10자리 번호 → true', () => {
    expect(isValidPhone('0212345678')).toBe(true);
  });

  it('9자리 → false (하한 경계값 아래)', () => {
    expect(isValidPhone('012345678')).toBe(false);
  });

  it('12자리 → false (상한 경계값 초과)', () => {
    expect(isValidPhone('010123456789')).toBe(false);
  });

  it('하이픈 포함 → false', () => {
    expect(isValidPhone('010-1234-5678')).toBe(false);
  });

  it('문자 포함 → false', () => {
    expect(isValidPhone('010-abcd-5678')).toBe(false);
  });
});

describe('isEmpty', () => {
  it('빈 문자열 → true', () => {
    expect(isEmpty('')).toBe(true);
  });

  it('공백만 → true', () => {
    expect(isEmpty('   ')).toBe(true);
  });

  it('null → true', () => {
    expect(isEmpty(null)).toBe(true);
  });

  it('undefined → true', () => {
    expect(isEmpty(undefined)).toBe(true);
  });

  it('일반 문자열 → false', () => {
    expect(isEmpty('hello')).toBe(false);
  });

  it('앞뒤 공백 포함 문자열 → false', () => {
    expect(isEmpty('  a  ')).toBe(false);
  });
});

describe('validateBugReport', () => {
  const validReport: CreateBugReportRequest = {
    category: 'bug',
    title: '로그인 오류',
    description: '로그인 버튼을 눌러도 반응이 없습니다.',
  };

  it('유효한 데이터 → isValid true, errors 비어있음', () => {
    const { isValid, errors } = validateBugReport(validReport);
    expect(isValid).toBe(true);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('카테고리 없음 → errors.category 존재', () => {
    const { isValid, errors } = validateBugReport({
      ...validReport,
      category: '' as CreateBugReportRequest['category'],
    });
    expect(isValid).toBe(false);
    expect(errors.category).toBeDefined();
  });

  it('제목 빈 문자열 → errors.title 존재', () => {
    const { isValid, errors } = validateBugReport({ ...validReport, title: '' });
    expect(isValid).toBe(false);
    expect(errors.title).toBeDefined();
  });

  it('제목 30자 초과 → errors.title 존재', () => {
    const { isValid, errors } = validateBugReport({
      ...validReport,
      title: 'a'.repeat(31),
    });
    expect(isValid).toBe(false);
    expect(errors.title).toBeDefined();
  });

  it('설명 빈 문자열 → errors.description 존재', () => {
    const { isValid, errors } = validateBugReport({ ...validReport, description: '' });
    expect(isValid).toBe(false);
    expect(errors.description).toBeDefined();
  });

  it('설명 500자 초과 → errors.description 존재', () => {
    const { isValid, errors } = validateBugReport({
      ...validReport,
      description: 'a'.repeat(501),
    });
    expect(isValid).toBe(false);
    expect(errors.description).toBeDefined();
  });

  it('이미지 5장 초과 → errors.images 존재', () => {
    const images = Array.from({ length: 6 }, () => new File(['x'], 'img.png', { type: 'image/png' }));
    const { isValid, errors } = validateBugReport(validReport, images);
    expect(isValid).toBe(false);
    expect(errors.images).toBeDefined();
  });

  it('이미지 크기 5MB 초과 → errors.images 존재', () => {
    const bigFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'big.png', { type: 'image/png' });
    const { isValid, errors } = validateBugReport(validReport, [bigFile]);
    expect(isValid).toBe(false);
    expect(errors.images).toBeDefined();
  });

  it('허용되지 않는 이미지 형식 → errors.images 존재', () => {
    const svgFile = new File(['<svg></svg>'], 'icon.svg', { type: 'image/svg+xml' });
    const { isValid, errors } = validateBugReport(validReport, [svgFile]);
    expect(isValid).toBe(false);
    expect(errors.images).toBeDefined();
  });

  it('이미지 없음 → 이미지 관련 에러 없음', () => {
    const { errors } = validateBugReport(validReport);
    expect(errors.images).toBeUndefined();
  });

  it('유효한 이미지 → errors.images 없음', () => {
    const validImage = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    const { isValid, errors } = validateBugReport(validReport, [validImage]);
    expect(isValid).toBe(true);
    expect(errors.images).toBeUndefined();
  });
});
