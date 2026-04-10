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
} from '@shared/utils/validation';

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
