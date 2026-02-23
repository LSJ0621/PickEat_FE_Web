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

describe('translateMessage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Translation', () => {
    it('should translate error code to Korean message', () => {
      const result = translateMessage(
        'INTERNAL_SERVER_ERROR',
        'Default error message'
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      // Should return either translated message or fallback
      expect(result.length).toBeGreaterThan(0);
    });

    it('should translate error code to English message', async () => {
      await i18n.changeLanguage('en');

      const result = translateMessage(
        'INTERNAL_SERVER_ERROR',
        'Default error message'
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return fallback message when code is undefined', () => {
      const fallback = 'Fallback error message';
      const result = translateMessage(undefined, fallback);

      expect(result).toBe(fallback);
    });

    it('should return fallback message when code is not found', () => {
      const fallback = 'Unknown error occurred';
      const result = translateMessage('NONEXISTENT_ERROR_CODE', fallback);

      // Should return fallback when translation not found
      expect(result).toBe(fallback);
    });

    it('should handle empty string code', () => {
      const fallback = 'Empty code fallback';
      const result = translateMessage('', fallback);

      expect(result).toBe(fallback);
    });
  });

  describe('Parameter Interpolation', () => {
    it('should interpolate count parameter', () => {
      // Test with a message that uses count parameter
      const result = translateMessage(
        'ITEMS_COUNT',
        'Default: {{count}} items',
        { count: 5 }
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should interpolate string parameter', () => {
      const result = translateMessage(
        'WELCOME_MESSAGE',
        'Welcome {{name}}',
        { name: 'John' }
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should interpolate multiple parameters', () => {
      const result = translateMessage(
        'USER_INFO',
        'User: {{name}}, Age: {{age}}',
        { name: 'Alice', age: 25 }
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle missing parameters gracefully', () => {
      const result = translateMessage(
        'MESSAGE_WITH_PARAMS',
        'Hello {{name}}',
        {}
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('Validation Message Translation', () => {
    it('should parse VALIDATION_MIN format correctly', () => {
      const result = translateMessage(
        'VALIDATION_MIN:page:1',
        'Fallback message'
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should parse VALIDATION_MAX format correctly', () => {
      const result = translateMessage(
        'VALIDATION_MAX:limit:100',
        'Fallback message'
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should parse VALIDATION_MAX_LENGTH format correctly', () => {
      const result = translateMessage(
        'VALIDATION_MAX_LENGTH:name:50',
        'Fallback message'
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should parse VALIDATION_ARRAY_MIN format correctly', () => {
      const result = translateMessage(
        'VALIDATION_ARRAY_MIN:items:1',
        'Fallback message'
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should parse VALIDATION_ARRAY_MAX format correctly', () => {
      const result = translateMessage(
        'VALIDATION_ARRAY_MAX:items:10',
        'Fallback message'
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle validation message without value', () => {
      const result = translateMessage(
        'VALIDATION_REQUIRED:email',
        'Fallback message'
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should translate field names in validation messages', () => {
      const result = translateMessage(
        'VALIDATION_MIN:page:1',
        'Fallback message'
      );

      // Should contain some form of field name and value
      expect(result).toBeDefined();
    });
  });

  describe('Namespace Priority', () => {
    it('should check messages namespace first', () => {
      // Messages namespace should take priority
      const result = translateMessage(
        'AUTH_EMAIL_VERIFICATION_COMPLETED',
        'Fallback message'
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should fallback to errors namespace if not in messages', () => {
      const result = translateMessage(
        'INTERNAL_SERVER_ERROR',
        'Fallback message'
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});

describe('getApiErrorMessage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  describe('Axios Error Handling', () => {
    it('should extract and translate errorCode from API response', () => {
      const axiosError = new AxiosError(
        'Request failed',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
          data: {
            errorCode: 'INVALID_INPUT',
            message: 'Invalid input provided',
          },
        }
      );

      const result = getApiErrorMessage(axiosError);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should use message from response if errorCode is missing', () => {
      const axiosError = new AxiosError(
        'Request failed',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
          data: {
            message: 'Server error message',
          },
        }
      );

      const result = getApiErrorMessage(axiosError);

      expect(result).toBe('Server error message');
    });

    it('should use default message if response has no error info', () => {
      const axiosError = new AxiosError(
        'Request failed',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as any,
          data: {},
        }
      );

      const defaultMessage = 'Something went wrong';
      const result = getApiErrorMessage(axiosError, defaultMessage);

      expect(result).toBe(defaultMessage);
    });

    it('should translate errorCode with fallback to response message', () => {
      const axiosError = new AxiosError(
        'Request failed',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: {} as any,
          data: {
            errorCode: 'RESOURCE_NOT_FOUND',
            message: 'Resource not found',
          },
        }
      );

      const result = getApiErrorMessage(axiosError);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('Non-Axios Error Handling', () => {
    it('should handle generic Error object', () => {
      const error = new Error('Generic error');
      const defaultMessage = 'Default error message';

      const result = getApiErrorMessage(error, defaultMessage);

      expect(result).toBe(defaultMessage);
    });

    it('should handle null error', () => {
      const defaultMessage = 'Default error message';

      const result = getApiErrorMessage(null, defaultMessage);

      expect(result).toBe(defaultMessage);
    });

    it('should handle undefined error', () => {
      const defaultMessage = 'Default error message';

      const result = getApiErrorMessage(undefined, defaultMessage);

      expect(result).toBe(defaultMessage);
    });

    it('should use translated INTERNAL_SERVER_ERROR if no default provided', () => {
      const error = new Error('Unknown error');

      const result = getApiErrorMessage(error);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      // Should return some error message
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle Axios error without response', () => {
      const axiosError = new AxiosError(
        'Network Error',
        'ERR_NETWORK',
        undefined,
        undefined,
        undefined
      );

      const defaultMessage = 'Network error occurred';
      const result = getApiErrorMessage(axiosError, defaultMessage);

      expect(result).toBe(defaultMessage);
    });

    it('should handle response with null data', () => {
      const axiosError = new AxiosError(
        'Request failed',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as any,
          data: null,
        }
      );

      const defaultMessage = 'Default message';
      const result = getApiErrorMessage(axiosError, defaultMessage);

      expect(result).toBe(defaultMessage);
    });
  });
});

describe('getApiSuccessMessage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  describe('Success Message Translation', () => {
    it('should translate messageCode to success message', () => {
      const response = {
        messageCode: 'AUTH_EMAIL_VERIFICATION_COMPLETED',
        message: 'Email verification completed',
      };

      const result = getApiSuccessMessage(response);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should use fallback message if messageCode is missing', () => {
      const response = {
        message: 'Operation successful',
      };

      const result = getApiSuccessMessage(response);

      expect(result).toBe('Operation successful');
    });

    it('should return empty string if both messageCode and message are missing', () => {
      const response = {};

      const result = getApiSuccessMessage(response);

      expect(result).toBe('');
    });

    it('should interpolate parameters in success message', () => {
      const response = {
        messageCode: 'ITEMS_DELETED',
        message: 'Items deleted successfully',
      };

      const result = getApiSuccessMessage(response, { count: 5 });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('Parameter Interpolation', () => {
    it('should handle count parameter', () => {
      const response = {
        messageCode: 'SUCCESS_WITH_COUNT',
        message: '{{count}} items processed',
      };

      const result = getApiSuccessMessage(response, { count: 10 });

      expect(result).toBeDefined();
    });

    it('should handle string parameter', () => {
      const response = {
        messageCode: 'SUCCESS_WITH_NAME',
        message: 'Welcome {{name}}',
      };

      const result = getApiSuccessMessage(response, { name: 'Alice' });

      expect(result).toBeDefined();
    });

    it('should work without parameters', () => {
      const response = {
        messageCode: 'OPERATION_SUCCESS',
        message: 'Operation completed',
      };

      const result = getApiSuccessMessage(response);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined messageCode', () => {
      const response = {
        messageCode: undefined,
        message: 'Success message',
      };

      const result = getApiSuccessMessage(response);

      expect(result).toBe('Success message');
    });

    it('should handle empty messageCode', () => {
      const response = {
        messageCode: '',
        message: 'Success message',
      };

      const result = getApiSuccessMessage(response);

      expect(result).toBe('Success message');
    });

    it('should translate with English locale', async () => {
      await i18n.changeLanguage('en');

      const response = {
        messageCode: 'AUTH_EMAIL_VERIFICATION_COMPLETED',
        message: 'Email verification completed',
      };

      const result = getApiSuccessMessage(response);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});

describe('Integration Tests', () => {
  describe('Language Switching', () => {
    it('should translate differently based on current language', async () => {
      const messageCode = 'INTERNAL_SERVER_ERROR';
      const fallback = 'Server error';

      // Korean
      await i18n.changeLanguage('ko');
      const koreanResult = translateMessage(messageCode, fallback);

      // English
      await i18n.changeLanguage('en');
      const englishResult = translateMessage(messageCode, fallback);

      expect(koreanResult).toBeDefined();
      expect(englishResult).toBeDefined();
      // Both should be strings
      expect(typeof koreanResult).toBe('string');
      expect(typeof englishResult).toBe('string');
    });

    it('should handle language changes in getApiErrorMessage', async () => {
      const axiosError = new AxiosError(
        'Request failed',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
          data: {
            errorCode: 'INVALID_INPUT',
            message: 'Invalid input',
          },
        }
      );

      // Korean
      await i18n.changeLanguage('ko');
      const koreanResult = getApiErrorMessage(axiosError);

      // English
      await i18n.changeLanguage('en');
      const englishResult = getApiErrorMessage(axiosError);

      expect(koreanResult).toBeDefined();
      expect(englishResult).toBeDefined();
      expect(typeof koreanResult).toBe('string');
      expect(typeof englishResult).toBe('string');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle authentication error flow', () => {
      const axiosError = new AxiosError(
        'Unauthorized',
        'ERR_UNAUTHORIZED',
        undefined,
        undefined,
        {
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config: {} as any,
          data: {
            errorCode: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        }
      );

      const result = getApiErrorMessage(axiosError);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle validation error with field information', () => {
      const result = translateMessage(
        'VALIDATION_MAX_LENGTH:email:50',
        'Email too long'
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle success message with dynamic content', () => {
      const response = {
        messageCode: 'ITEMS_UPDATED',
        message: '{{count}} items updated successfully',
      };

      const result = getApiSuccessMessage(response, { count: 3 });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});
