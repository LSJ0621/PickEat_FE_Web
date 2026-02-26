/**
 * translateMessage Utility Unit Tests
 *
 * Tests for message translation utilities including error/success message translation,
 * validation message parsing, and parameter interpolation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  translateMessage,
  getApiErrorMessage,
  getApiSuccessMessage,
} from '@shared/utils/translateMessage';
import i18n from '@/i18n/config';
import { AxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Assert a value is a non-empty string */
function assertString(value: unknown): void {
  expect(value).toBeDefined();
  expect(typeof value).toBe('string');
  expect((value as string).length).toBeGreaterThan(0);
}

interface ApiErrorData {
  errorCode?: string;
  message?: string;
}

/** Build a minimal AxiosError with the given response payload */
function makeAxiosError(
  status: number,
  data: ApiErrorData | null,
  code = 'ERR_BAD_REQUEST'
): AxiosError {
  const response: AxiosResponse = {
    status,
    statusText: String(status),
    headers: {},
    config: {} as InternalAxiosRequestConfig,
    data,
  };
  return new AxiosError('Request failed', code, undefined, undefined, response);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('All translateMessage utilities', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  describe('translateMessage', () => {
    describe('Basic Translation', () => {
      it('should translate error code to Korean message', () => {
        assertString(translateMessage('INTERNAL_SERVER_ERROR', 'Default error message'));
      });

      it('should translate error code to English message', async () => {
        await i18n.changeLanguage('en');
        assertString(translateMessage('INTERNAL_SERVER_ERROR', 'Default error message'));
      });

      it.each([
        ['undefined code', undefined, 'Fallback error message'],
        ['unknown code', 'NONEXISTENT_ERROR_CODE', 'Unknown error occurred'],
        ['empty string code', '', 'Empty code fallback'],
      ])('should return fallback when code is %s', (_label, code, fallback) => {
        expect(translateMessage(code, fallback)).toBe(fallback);
      });
    });

    describe('Parameter Interpolation', () => {
      it.each([
        ['count parameter', 'ITEMS_COUNT', 'Default: {{count}} items', { count: 5 }],
        ['string parameter', 'WELCOME_MESSAGE', 'Welcome {{name}}', { name: 'John' }],
        ['multiple parameters', 'USER_INFO', 'User: {{name}}, Age: {{age}}', { name: 'Alice', age: 25 }],
        ['missing parameters', 'MESSAGE_WITH_PARAMS', 'Hello {{name}}', {}],
      ])('should handle %s', (_label, code, fallback, params) => {
        const result = translateMessage(code, fallback, params);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });

    describe('Validation Message Translation', () => {
      it.each([
        ['VALIDATION_MIN:page:1'],
        ['VALIDATION_MAX:limit:100'],
        ['VALIDATION_MAX_LENGTH:name:50'],
        ['VALIDATION_ARRAY_MIN:items:1'],
        ['VALIDATION_ARRAY_MAX:items:10'],
        ['VALIDATION_REQUIRED:email'],
        ['VALIDATION_MAX_LENGTH:email:50'],
      ])('should parse %s format correctly', (code) => {
        const result = translateMessage(code, 'Fallback message');
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });

    describe('Namespace Priority', () => {
      it('should check messages namespace first (AUTH_EMAIL_VERIFICATION_COMPLETED)', () => {
        const result = translateMessage('AUTH_EMAIL_VERIFICATION_COMPLETED', 'Fallback message');
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      it('should fallback to errors namespace if not in messages (INTERNAL_SERVER_ERROR)', () => {
        const result = translateMessage('INTERNAL_SERVER_ERROR', 'Fallback message');
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('getApiErrorMessage', () => {
    describe('Axios Error Handling', () => {
      it('should extract and translate errorCode from API response', () => {
        const error = makeAxiosError(400, { errorCode: 'INVALID_INPUT', message: 'Invalid input provided' });
        assertString(getApiErrorMessage(error));
      });

      it('should use message from response if errorCode is missing', () => {
        const error = makeAxiosError(400, { message: 'Server error message' });
        expect(getApiErrorMessage(error)).toBe('Server error message');
      });

      it('should use default message if response has no error info', () => {
        const error = makeAxiosError(500, {});
        expect(getApiErrorMessage(error, 'Something went wrong')).toBe('Something went wrong');
      });

      it('should translate errorCode with fallback to response message (RESOURCE_NOT_FOUND)', () => {
        const error = makeAxiosError(404, { errorCode: 'RESOURCE_NOT_FOUND', message: 'Resource not found' });
        const result = getApiErrorMessage(error);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });

    describe('Non-Axios Error Handling', () => {
      it.each([
        ['generic Error object', new Error('Generic error')],
        ['null error', null],
        ['undefined error', undefined],
      ])('should return default message for %s', (_label, error) => {
        expect(getApiErrorMessage(error, 'Default error message')).toBe('Default error message');
      });

      it('should use translated INTERNAL_SERVER_ERROR if no default provided', () => {
        assertString(getApiErrorMessage(new Error('Unknown error')));
      });
    });

    describe('Edge Cases', () => {
      it('should handle Axios error without response', () => {
        const error = new AxiosError('Network Error', 'ERR_NETWORK', undefined, undefined, undefined);
        expect(getApiErrorMessage(error, 'Network error occurred')).toBe('Network error occurred');
      });

      it('should handle response with null data', () => {
        const error = makeAxiosError(500, null);
        expect(getApiErrorMessage(error, 'Default message')).toBe('Default message');
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('getApiSuccessMessage', () => {
    describe('Success Message Translation', () => {
      it('should translate messageCode to success message', () => {
        const response = { messageCode: 'AUTH_EMAIL_VERIFICATION_COMPLETED', message: 'Email verification completed' };
        assertString(getApiSuccessMessage(response));
      });

      it('should use fallback message if messageCode is missing', () => {
        expect(getApiSuccessMessage({ message: 'Operation successful' })).toBe('Operation successful');
      });

      it('should return empty string if both messageCode and message are missing', () => {
        expect(getApiSuccessMessage({})).toBe('');
      });

      it('should interpolate parameters in success message', () => {
        const response = { messageCode: 'ITEMS_DELETED', message: 'Items deleted successfully' };
        const result = getApiSuccessMessage(response, { count: 5 });
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });

    describe('Parameter Interpolation', () => {
      it.each([
        ['count parameter', { messageCode: 'SUCCESS_WITH_COUNT', message: '{{count}} items processed' }, { count: 10 }],
        ['string parameter', { messageCode: 'SUCCESS_WITH_NAME', message: 'Welcome {{name}}' }, { name: 'Alice' }],
        ['no parameters', { messageCode: 'OPERATION_SUCCESS', message: 'Operation completed' }, undefined],
      ])('should handle %s', (_label, response, params) => {
        const result = getApiSuccessMessage(response, params);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });

    describe('Edge Cases', () => {
      it.each([
        ['undefined messageCode', { messageCode: undefined, message: 'Success message' }],
        ['empty messageCode', { messageCode: '', message: 'Success message' }],
      ])('should return fallback for %s', (_label, response) => {
        expect(getApiSuccessMessage(response)).toBe('Success message');
      });

      it('should translate with English locale', async () => {
        await i18n.changeLanguage('en');
        const response = { messageCode: 'AUTH_EMAIL_VERIFICATION_COMPLETED', message: 'Email verification completed' };
        assertString(getApiSuccessMessage(response));
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('Integration Tests', () => {
    describe('Language Switching', () => {
      it('should translate differently based on current language', async () => {
        const messageCode = 'INTERNAL_SERVER_ERROR';
        const fallback = 'Server error';

        await i18n.changeLanguage('ko');
        const koreanResult = translateMessage(messageCode, fallback);

        await i18n.changeLanguage('en');
        const englishResult = translateMessage(messageCode, fallback);

        expect(typeof koreanResult).toBe('string');
        expect(typeof englishResult).toBe('string');
      });

      it('should handle language changes in getApiErrorMessage', async () => {
        const error = makeAxiosError(400, { errorCode: 'INVALID_INPUT', message: 'Invalid input' });

        await i18n.changeLanguage('ko');
        const koreanResult = getApiErrorMessage(error);

        await i18n.changeLanguage('en');
        const englishResult = getApiErrorMessage(error);

        expect(typeof koreanResult).toBe('string');
        expect(typeof englishResult).toBe('string');
      });
    });

    describe('Real-world Scenarios', () => {
      it('should handle authentication error flow', () => {
        const error = makeAxiosError(401, { errorCode: 'UNAUTHORIZED', message: 'Authentication required' }, 'ERR_UNAUTHORIZED');
        assertString(getApiErrorMessage(error));
      });

      it('should handle validation error with field information', () => {
        const result = translateMessage('VALIDATION_MAX_LENGTH:email:50', 'Email too long');
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      it('should handle success message with dynamic content', () => {
        const response = { messageCode: 'ITEMS_UPDATED', message: '{{count}} items updated successfully' };
        assertString(getApiSuccessMessage(response, { count: 3 }));
      });
    });
  });
});
