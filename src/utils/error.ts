interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export const extractErrorMessage = (error: unknown, fallbackMessage = '오류가 발생했습니다.') => {
  if (typeof error === 'string') {
    return error;
  }

  // 우선순위: 서버 응답 message > 기본 message
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

  return fallbackMessage;
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
    handleError(new Error('네트워크 연결을 확인해주세요.'), context);
  } else {
    handleError(error, context);
  }
}

