import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatNumber,
  formatPrice,
  formatPhone,
  formatDateTime,
  formatDateKorean,
  formatDateTimeKorean,
  formatSeconds,
} from '@/utils/format';

describe('formatDate', () => {
  it('should format date with default format (YYYY-MM-DD)', () => {
    const date = new Date('2024-01-15T10:30:45');
    expect(formatDate(date)).toBe('2024-01-15');
  });

  it('should format date with custom format', () => {
    const date = new Date('2024-01-15T10:30:45');
    expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2024-01-15 10:30:45');
  });

  it('should handle date string input', () => {
    expect(formatDate('2024-01-15T10:30:45')).toBe('2024-01-15');
  });

  it('should pad single digit months and days', () => {
    const date = new Date('2024-01-05T08:05:05');
    expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2024-01-05 08:05:05');
  });

  it('should handle different format patterns', () => {
    const date = new Date('2024-01-15T10:30:45');
    expect(formatDate(date, 'DD/MM/YYYY')).toBe('15/01/2024');
    expect(formatDate(date, 'HH:mm')).toBe('10:30');
  });
});

describe('formatNumber', () => {
  it('should format numbers with thousand separators', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
    expect(formatNumber(123456789)).toBe('123,456,789');
  });

  it('should handle small numbers', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(100)).toBe('100');
    expect(formatNumber(999)).toBe('999');
  });

  it('should handle negative numbers', () => {
    expect(formatNumber(-1000)).toBe('-1,000');
    expect(formatNumber(-123456)).toBe('-123,456');
  });
});

describe('formatPrice', () => {
  it('should format price with currency', () => {
    expect(formatPrice(1000)).toBe('1,000원');
    expect(formatPrice(10000)).toBe('10,000원');
    expect(formatPrice(1234567)).toBe('1,234,567원');
  });

  it('should handle zero price', () => {
    expect(formatPrice(0)).toBe('0원');
  });

  it('should handle negative prices', () => {
    expect(formatPrice(-1000)).toBe('-1,000원');
  });
});

describe('formatPhone', () => {
  it('should format 11-digit phone numbers', () => {
    expect(formatPhone('01012345678')).toBe('010-1234-5678');
    expect(formatPhone('01087654321')).toBe('010-8765-4321');
  });

  it('should format 10-digit phone numbers', () => {
    expect(formatPhone('0212345678')).toBe('021-234-5678');
    expect(formatPhone('0311234567')).toBe('031-123-4567');
  });

  it('should remove non-digit characters before formatting', () => {
    expect(formatPhone('010-1234-5678')).toBe('010-1234-5678');
    expect(formatPhone('010 1234 5678')).toBe('010-1234-5678');
  });

  it('should return original string for invalid length', () => {
    expect(formatPhone('123')).toBe('123');
    expect(formatPhone('123456789012')).toBe('123456789012');
  });

  it('should handle empty string', () => {
    expect(formatPhone('')).toBe('');
  });

  it('should handle strings with letters', () => {
    // Only 3 digits after removing letters - returns original
    expect(formatPhone('abc123def')).toBe('abc123def');
  });
});

describe('formatDateTime', () => {
  it('should format datetime with default format', () => {
    const date = new Date('2024-01-15T14:30:45');
    expect(formatDateTime(date)).toBe('2024-01-15 14:30');
  });

  it('should format datetime with custom format', () => {
    const date = new Date('2024-01-15T14:30:45');
    expect(formatDateTime(date, 'YYYY/MM/DD HH:mm:ss')).toBe('2024/01/15 14:30:45');
  });

  it('should handle string input', () => {
    expect(formatDateTime('2024-01-15T14:30:45')).toBe('2024-01-15 14:30');
  });
});

describe('formatDateKorean', () => {
  it('should format date in Korean locale', () => {
    const date = new Date('2024-01-15');
    const result = formatDateKorean(date);
    expect(result).toMatch(/2024년/);
    expect(result).toMatch(/1월/);
    expect(result).toMatch(/15일/);
  });

  it('should handle string input', () => {
    const result = formatDateKorean('2024-01-15');
    expect(result).toMatch(/2024년/);
  });
});

describe('formatDateTimeKorean', () => {
  it('should format datetime in Korean locale', () => {
    const date = new Date('2024-01-15T14:30:00');
    const result = formatDateTimeKorean(date);
    expect(result).toMatch(/2024년/);
    expect(result).toMatch(/1월/);
    expect(result).toMatch(/15일/);
    expect(result).toMatch(/오후|02:30/); // Korean locale uses AM/PM format
  });

  it('should handle string input', () => {
    const result = formatDateTimeKorean('2024-01-15T14:30:00');
    expect(result).toMatch(/2024년/);
  });
});

describe('formatSeconds', () => {
  it('should format seconds to MM:SS', () => {
    expect(formatSeconds(0)).toBe('00:00');
    expect(formatSeconds(59)).toBe('00:59');
    expect(formatSeconds(60)).toBe('01:00');
    expect(formatSeconds(90)).toBe('01:30');
    expect(formatSeconds(125)).toBe('02:05');
  });

  it('should handle large numbers', () => {
    expect(formatSeconds(3599)).toBe('59:59');
    expect(formatSeconds(3600)).toBe('60:00');
  });

  it('should pad single digits', () => {
    expect(formatSeconds(5)).toBe('00:05');
    expect(formatSeconds(65)).toBe('01:05');
  });
});
