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

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    const apiError = error as ApiErrorResponse;
    return apiError.response?.data?.message || apiError.message || fallbackMessage;
  }

  return fallbackMessage;
};

