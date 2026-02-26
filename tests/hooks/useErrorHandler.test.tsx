import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import { useToast } from '@shared/hooks/useToast';
import { AxiosError } from 'axios';

vi.mock('@shared/hooks/useToast');

describe('useErrorHandler', () => {
  const mockToastError = vi.fn();
  const mockToastSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useToast).mockReturnValue({
      error: mockToastError,
      success: mockToastSuccess,
      info: vi.fn(),
      warning: vi.fn(),
    });
  });

  describe('handleError', () => {
    it('should handle validation error (400)', () => {
      const axiosError = new AxiosError('Validation failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Validation failed' },
        statusText: 'Bad Request',
        headers: {},
        config: {
          headers: {} as unknown as Record<string, string>
        } as never,
      };

      const { result } = renderHook(() => useErrorHandler());

      result.current.handleError(axiosError);

      expect(mockToastError).toHaveBeenCalledWith('Validation failed', 4000);
    });

    it('should handle auth error (401)', () => {
      const axiosError = new AxiosError('Unauthorized');
      axiosError.response = {
        status: 401,
        data: { message: 'Unauthorized' },
        statusText: 'Unauthorized',
        headers: {},
        config: {
          headers: {} as unknown as Record<string, string>
        } as never,
      };

      const { result } = renderHook(() => useErrorHandler());

      result.current.handleError(axiosError);

      expect(mockToastError).toHaveBeenCalledWith('Unauthorized', 5000);
    });

    it('should handle server error (500)', () => {
      const axiosError = new AxiosError('Server error');
      axiosError.response = {
        status: 500,
        data: { message: 'Server error' },
        statusText: 'Internal Server Error',
        headers: {},
        config: {
          headers: {} as unknown as Record<string, string>
        } as never,
      };

      const { result } = renderHook(() => useErrorHandler());

      result.current.handleError(axiosError);

      expect(mockToastError).toHaveBeenCalledWith('Server error', 5000);
    });

    it('should handle not found error (404)', () => {
      const axiosError = new AxiosError('Not found');
      axiosError.response = {
        status: 404,
        data: { message: 'Not found' },
        statusText: 'Not Found',
        headers: {},
        config: {
          headers: {} as unknown as Record<string, string>
        } as never,
      };

      const { result } = renderHook(() => useErrorHandler());

      result.current.handleError(axiosError);

      expect(mockToastError).toHaveBeenCalledWith('Not found', 5000);
    });

    it('should handle network error', () => {
      const axiosError = new AxiosError('Network Error');
      // No response means network error

      const { result } = renderHook(() => useErrorHandler());

      result.current.handleError(axiosError);

      expect(mockToastError).toHaveBeenCalledWith('Network Error', 5000);
    });

    it('should handle generic error', () => {
      const error = new Error('Something went wrong');

      const { result } = renderHook(() => useErrorHandler());

      result.current.handleError(error);

      expect(mockToastError).toHaveBeenCalledWith('Something went wrong', 5000);
    });

    it('should use default message for unknown error', () => {
      const { result } = renderHook(() => useErrorHandler());

      result.current.handleError({});

      expect(mockToastError).toHaveBeenCalledWith('오류가 발생했습니다', 5000);
    });
  });

  describe('handleSuccess', () => {
    it('should call toast.success with translated message from key', () => {
      const { result } = renderHook(() => useErrorHandler());

      // handleSuccess takes a translation key; t('Success message') falls back to 'Success message'
      result.current.handleSuccess('Success message');

      expect(mockToastSuccess).toHaveBeenCalledWith('Success message', undefined);
    });

    it('should call toast.success with custom duration', () => {
      const { result } = renderHook(() => useErrorHandler());

      result.current.handleSuccess('Success message', {}, 3000);

      expect(mockToastSuccess).toHaveBeenCalledWith('Success message', 3000);
    });
  });
});
