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

