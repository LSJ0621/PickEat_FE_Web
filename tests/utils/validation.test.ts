import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  isPasswordMatch,
  isValidPhone,
  isEmpty,
  validateBugReport,
} from '@shared/utils/validation';
import type { CreateBugReportRequest } from '@/types/bug-report';

describe('isValidEmail', () => {
  it('should return true for valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.kr')).toBe(true);
    expect(isValidEmail('a@b.c')).toBe(true);
  });

  it('should return false for invalid emails', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(isValidEmail('@invalid.com')).toBe(false);
    expect(isValidEmail('invalid@domain')).toBe(false);
    expect(isValidEmail('invalid @domain.com')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('should return true for passwords with 6 or more characters', () => {
    expect(isValidPassword('123456')).toBe(true);
    expect(isValidPassword('password')).toBe(true);
    expect(isValidPassword('a'.repeat(100))).toBe(true);
  });

  it('should return false for passwords with less than 6 characters', () => {
    expect(isValidPassword('12345')).toBe(false);
    expect(isValidPassword('a')).toBe(false);
    expect(isValidPassword('')).toBe(false);
  });
});

describe('isPasswordMatch', () => {
  it('should return true for matching passwords', () => {
    expect(isPasswordMatch('password', 'password')).toBe(true);
    expect(isPasswordMatch('123456', '123456')).toBe(true);
  });

  it('should return false for non-matching passwords', () => {
    expect(isPasswordMatch('password', 'Password')).toBe(false);
    expect(isPasswordMatch('123456', '12345')).toBe(false);
  });

  it('should handle empty strings', () => {
    expect(isPasswordMatch('', '')).toBe(true);
    expect(isPasswordMatch('password', '')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('should return true for valid 10-digit phone numbers', () => {
    expect(isValidPhone('0212345678')).toBe(true);
  });

  it('should return true for valid 11-digit phone numbers', () => {
    expect(isValidPhone('01012345678')).toBe(true);
  });

  it('should return false for invalid phone numbers', () => {
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('010-1234-5678')).toBe(false);
    expect(isValidPhone('010 1234 5678')).toBe(false);
    expect(isValidPhone('abcdefghijk')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidPhone('')).toBe(false);
  });
});

describe('isEmpty', () => {
  it('should return true for empty or whitespace strings', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
    expect(isEmpty('\t\n')).toBe(true);
  });

  it('should return true for null or undefined', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  it('should return false for non-empty strings', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty('  text  ')).toBe(false);
  });
});

describe('validateBugReport', () => {
  const validData: CreateBugReportRequest = {
    category: 'BUG',
    title: 'Test Bug',
    description: 'This is a test bug description',
  };

  it('should validate a valid bug report', () => {
    const result = validateBugReport(validData);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('should require category', () => {
    const data = { ...validData, category: '' };
    const result = validateBugReport(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.category).toBe('카테고리를 선택해주세요.');
  });

  it('should require title', () => {
    const data = { ...validData, title: '' };
    const result = validateBugReport(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('제목을 입력해주세요.');
  });

  it('should validate title max length', () => {
    const data = { ...validData, title: 'a'.repeat(31) };
    const result = validateBugReport(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toContain('30자 이하');
  });

  it('should require description', () => {
    const data = { ...validData, description: '' };
    const result = validateBugReport(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.description).toBe('상세 내용을 입력해주세요.');
  });

  it('should validate description max length', () => {
    const data = { ...validData, description: 'a'.repeat(501) };
    const result = validateBugReport(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.description).toContain('500자 이하');
  });

  it('should validate image count', () => {
    const mockFiles = Array(6).fill(
      new File([''], 'test.jpg', { type: 'image/jpeg' })
    ) as File[];
    const result = validateBugReport(validData, mockFiles);
    expect(result.isValid).toBe(false);
    expect(result.errors.images).toContain('최대 5장');
  });

  it('should validate image size', () => {
    const largeFile = new File(
      [new ArrayBuffer(6 * 1024 * 1024)],
      'large.jpg',
      { type: 'image/jpeg' }
    );
    const result = validateBugReport(validData, [largeFile]);
    expect(result.isValid).toBe(false);
    expect(result.errors.images).toContain('최대 5MB');
  });

  it('should validate image type', () => {
    const invalidFile = new File([''], 'test.pdf', { type: 'application/pdf' });
    const result = validateBugReport(validData, [invalidFile]);
    expect(result.isValid).toBe(false);
    expect(result.errors.images).toContain('지원하지 않는 이미지 형식');
  });

  it('should accept valid images', () => {
    const validFiles = [
      new File([''], 'test1.jpg', { type: 'image/jpeg' }),
      new File([''], 'test2.png', { type: 'image/png' }),
      new File([''], 'test3.gif', { type: 'image/gif' }),
    ];
    const result = validateBugReport(validData, validFiles);
    expect(result.isValid).toBe(true);
    expect(result.errors.images).toBeUndefined();
  });

  it('should handle whitespace-only title and description', () => {
    const data = { ...validData, title: '   ', description: '   ' };
    const result = validateBugReport(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('제목을 입력해주세요.');
    expect(result.errors.description).toBe('상세 내용을 입력해주세요.');
  });
});
