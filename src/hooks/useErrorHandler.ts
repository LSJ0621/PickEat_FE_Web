/**
 * 에러 처리 Hook
 * 일관된 에러 처리 방식을 제공
 */

import { useCallback } from 'react';
import { isAxiosError } from 'axios';
import { extractErrorMessage } from '@/utils/error';
import { useToast } from '@/components/common/ToastProvider';

export const ErrorType = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  SERVER: 'server',
  AUTH: 'auth',
  NOT_FOUND: 'not_found',
  UNKNOWN: 'unknown',
} as const;

export type ErrorTypeValue = (typeof ErrorType)[keyof typeof ErrorType];

const getErrorType = (error: unknown): ErrorTypeValue => {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 400) return ErrorType.VALIDATION;
    if (status === 401 || status === 403) return ErrorType.AUTH;
    if (status === 404) return ErrorType.NOT_FOUND;
    if (status === 500 || status === 503) return ErrorType.SERVER;
    if (!error.response) return ErrorType.NETWORK; // 네트워크 에러
  }
  return ErrorType.UNKNOWN;
};

export const useErrorHandler = () => {
  const toast = useToast();

  const handleError = useCallback(
    (error: unknown, context?: string) => {
      const message = extractErrorMessage(error, '오류가 발생했습니다.');
      const type = getErrorType(error);

      // 에러 타입별 duration 설정
      const duration = type === ErrorType.VALIDATION ? 4000 : 5000;
      toast.error(message, duration);
    },
    [toast]
  );

  const handleSuccess = useCallback(
    (message: string, duration?: number) => {
      toast.success(message, duration);
    },
    [toast]
  );

  return { handleError, handleSuccess };
};

