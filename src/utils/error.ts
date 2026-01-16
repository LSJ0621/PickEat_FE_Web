import axios from 'axios';
import i18n from '@/i18n/config';
import type { BackendErrorResponse } from '@/types/api';

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
      errorCode?: string;
      metadata?: Record<string, unknown>;
    };
  };
  message?: string;
}

/**
 * Translate backend errorCode to localized message
 */
export const translateErrorCode = (
  errorCode: string,
  metadata?: Record<string, unknown>
): string => {
  const key = `errors.${errorCode}`;

  if (i18n.exists(key)) {
    return i18n.t(key, metadata);
  }

  // fallback: unknown error
  return i18n.t('errors.UNKNOWN_ERROR');
};

export const extractErrorMessage = (error: unknown, fallbackMessage?: string) => {
  // Fallback message를 i18n으로 처리
  const defaultFallback = fallbackMessage ?? i18n.t('common.error');

  if (typeof error === 'string') {
    return error;
  }

  // 우선순위: errorCode 번역 > 서버 응답 message > 기본 message
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as BackendErrorResponse | undefined;

    // errorCode가 있으면 번역 사용
    if (responseData?.errorCode) {
      return translateErrorCode(responseData.errorCode, responseData.metadata);
    }

    // fallback: 기존 메시지 사용
    if (responseData?.message) {
      return responseData.message;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error && typeof error === 'object') {
    const apiError = error as ApiErrorResponse;
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
    if (apiError.message) {
      return apiError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultFallback;
};

/**
 * API 에러 처리 통합 함수
 * 네트워크 오류를 자동으로 감지하고 적절한 메시지를 제공합니다.
 *
 * @param error - 발생한 에러 객체
 * @param context - 에러 발생 컨텍스트 (로깅용)
 * @param handleError - 에러 핸들러 함수 (useErrorHandler의 handleError)
 */
export function handleApiError(
  error: unknown,
  context: string,
  handleError: (error: unknown, context: string) => void
): void {
  if (error instanceof Error && error.message.includes('Network')) {
    handleError(new Error(i18n.t('common.networkError')), context);
  } else {
    handleError(error, context);
  }
}

