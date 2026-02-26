import { describe, it, expect } from 'vitest';
import { extractErrorMessage } from '@shared/utils/error';

describe('extractErrorMessage', () => {
  it('should return error string when error is a string', () => {
    const result = extractErrorMessage('Custom error');
    expect(result).toBe('Custom error');
  });

  it('should return server response message when available', () => {
    const error = {
      response: {
        data: {
          message: 'Server error message',
        },
      },
      message: 'Client error message',
    };
    const result = extractErrorMessage(error);
    expect(result).toBe('Server error message');
  });

  it('should return error.message when response message is not available', () => {
    const error = {
      message: 'Client error message',
    };
    const result = extractErrorMessage(error);
    expect(result).toBe('Client error message');
  });

  it('should return Error instance message', () => {
    const error = new Error('Error instance message');
    const result = extractErrorMessage(error);
    expect(result).toBe('Error instance message');
  });

  it('should return fallback message when error is unknown type', () => {
    const result = extractErrorMessage(null);
    expect(result).toBe('오류가 발생했습니다');
  });

  it('should return custom fallback message', () => {
    const result = extractErrorMessage(null, '사용자 정의 오류');
    expect(result).toBe('사용자 정의 오류');
  });

  it('should return fallback message when error is empty object', () => {
    const result = extractErrorMessage({});
    expect(result).toBe('오류가 발생했습니다');
  });

  it('should return fallback message when error is undefined', () => {
    const result = extractErrorMessage(undefined);
    expect(result).toBe('오류가 발생했습니다');
  });

  it('should handle error with only response but no data', () => {
    const error = {
      response: {},
      message: 'Client error',
    };
    const result = extractErrorMessage(error);
    expect(result).toBe('Client error');
  });

  it('should handle error with response.data but no message', () => {
    const error = {
      response: {
        data: {},
      },
      message: 'Client error',
    };
    const result = extractErrorMessage(error);
    expect(result).toBe('Client error');
  });
});
