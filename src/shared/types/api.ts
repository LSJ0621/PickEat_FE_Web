/**
 * API 관련 타입 정의
 */

/**
 * Backend 에러 응답 타입
 * NestJS HttpExceptionFilter에서 생성되는 표준 에러 형식
 */
export interface BackendErrorResponse {
  statusCode: number;
  errorCode?: string;
  error: string;
  message: string;
  timestamp: string;
  path: string;
  metadata?: Record<string, unknown>;
}
