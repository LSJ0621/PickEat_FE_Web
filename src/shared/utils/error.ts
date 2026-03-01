import axios from 'axios';
import i18n from '@/i18n/config';
import type { BackendErrorResponse } from '@shared/types/api';

/**
 * HTTP 상태 코드별 사용자 친화적 메시지를 반환합니다.
 * 모듈 로드 시점이 아닌 호출 시점에 번역을 가져와 언어 변경이 반영됩니다.
 */
const getHttpStatusMessage = (status: number): string | undefined => {
  const HTTP_STATUS_MESSAGES: Record<number, string> = {
    400: i18n.t('errors.httpStatus.400'),
    401: i18n.t('errors.httpStatus.401'),
    403: i18n.t('errors.httpStatus.403'),
    404: i18n.t('errors.httpStatus.404'),
    409: i18n.t('errors.httpStatus.409'),
    500: i18n.t('errors.httpStatus.500'),
    502: i18n.t('errors.httpStatus.502'),
  };
  return HTTP_STATUS_MESSAGES[status];
};

/** 한글 포함 여부 감지 */
const isKorean = (text: string): boolean => /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(text);

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
    return isKorean(error) ? error : defaultFallback;
  }

  // 우선순위: errorCode 번역 > 서버 응답 message 필터링 > 기본 message
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as BackendErrorResponse | undefined;
    const httpStatus = error.response?.status;

    // errorCode가 있으면 번역 사용
    if (responseData?.errorCode) {
      return translateErrorCode(responseData.errorCode, responseData.metadata);
    }

    // 한국어 메시지면 그대로 반환
    if (responseData?.message && isKorean(responseData.message)) {
      return responseData.message;
    }

    // 영문 메시지 또는 메시지 없는 경우 → HTTP 상태 코드 기반 메시지
    if (httpStatus) {
      const statusMessage = getHttpStatusMessage(httpStatus);
      if (statusMessage) return statusMessage;
    }

    if (error.message) {
      return error.message;
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
  if (axios.isAxiosError(error) && !error.response) {
    handleError(new Error(i18n.t('common.networkError')), context);
  } else {
    handleError(error, context);
  }
}

