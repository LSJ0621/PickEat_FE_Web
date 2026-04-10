/**
 * error 유틸리티 테스트
 * 에러 메시지 추출 우선순위 및 translateErrorCode 동작 검증
 *
 * 우선순위: errorCode 번역 > 한국어 message > HTTP 상태 코드 메시지 > 기본 fallback
 */

import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { extractErrorMessage, translateErrorCode } from '@shared/utils/error';

// i18n 모킹 — 번역 키를 그대로 반환하여 우선순위 로직 검증에 집중
const mocks = vi.hoisted(() => ({
  t: vi.fn((key: string) => key),
  exists: vi.fn((_key: string) => true),
}));

vi.mock('@/i18n/config', () => ({
  default: {
    t: mocks.t,
    exists: mocks.exists,
  },
}));

/** AxiosError 생성 헬퍼 */
function createAxiosError(
  status: number,
  data: Record<string, unknown> = {},
  message = 'Request failed',
): AxiosError {
  const config = {} as InternalAxiosRequestConfig;
  const response: AxiosResponse = {
    data,
    status,
    statusText: 'Error',
    headers: {},
    config,
  };
  return new AxiosError(message, 'ERR_BAD_REQUEST', config, undefined, response);
}

describe('extractErrorMessage', () => {
  beforeEach(() => {
    mocks.t.mockImplementation((key: string) => key);
    mocks.exists.mockReturnValue(true);
  });

  describe('한국어 문자열 에러', () => {
    it('한국어 문자열 → 그대로 반환', () => {
      expect(extractErrorMessage('서버 오류가 발생했습니다.')).toBe('서버 오류가 발생했습니다.');
    });

    it('영어 문자열 → i18n fallback 키 반환', () => {
      const result = extractErrorMessage('Internal Server Error');
      expect(result).toBe('common.error');
    });
  });

  describe('Axios 에러 — 우선순위', () => {
    it('우선순위 1: errorCode 있으면 번역된 코드 반환', () => {
      const error = createAxiosError(400, { errorCode: 'USER_NOT_FOUND' });
      const result = extractErrorMessage(error);
      expect(result).toBe('errors.USER_NOT_FOUND');
    });

    it('우선순위 2: 한국어 message (errorCode 없음) → 직접 반환', () => {
      const error = createAxiosError(400, { message: '이미 사용 중인 이메일입니다.' });
      expect(extractErrorMessage(error)).toBe('이미 사용 중인 이메일입니다.');
    });

    it('우선순위 2보다 1이 높음: errorCode + 한국어 message → errorCode 번역 반환', () => {
      const error = createAxiosError(400, {
        errorCode: 'EMAIL_DUPLICATE',
        message: '이미 사용 중인 이메일입니다.',
      });
      const result = extractErrorMessage(error);
      expect(result).toBe('errors.EMAIL_DUPLICATE');
    });

    it('우선순위 3: 비한국어 message + 알려진 HTTP 상태 → 상태 코드 키 반환', () => {
      const error = createAxiosError(404, { message: 'Not Found' });
      expect(extractErrorMessage(error)).toBe('errors.httpStatus.404');
    });

    it('우선순위 3: 500 상태 → 상태 코드 키 반환', () => {
      const error = createAxiosError(500, {});
      expect(extractErrorMessage(error)).toBe('errors.httpStatus.500');
    });

    it('알 수 없는 HTTP 상태(418) → error.message 반환', () => {
      // 418은 상태 코드 맵에 없으므로 Axios error.message 사용
      mocks.t.mockImplementation((key: string) => {
        if (key.includes('httpStatus.418')) return '';
        return key;
      });
      const error = createAxiosError(418, {}, 'I am a teapot');
      expect(extractErrorMessage(error)).toBe('I am a teapot');
    });
  });

  describe('일반 Error 객체', () => {
    it('Error.message 반환', () => {
      expect(extractErrorMessage(new Error('네트워크 연결 실패'))).toBe('네트워크 연결 실패');
    });
  });

  describe('알 수 없는 타입', () => {
    it('fallbackMessage 있으면 반환', () => {
      expect(extractErrorMessage(42, '기본 오류 메시지')).toBe('기본 오류 메시지');
    });

    it('fallbackMessage 없으면 i18n common.error 키 반환', () => {
      expect(extractErrorMessage(null)).toBe('common.error');
    });

    it('객체 타입 에러 → fallback 반환', () => {
      expect(extractErrorMessage({ code: 'UNKNOWN' })).toBe('common.error');
    });
  });
});

describe('translateErrorCode', () => {
  beforeEach(() => {
    mocks.t.mockImplementation((key: string) => key);
    mocks.exists.mockReturnValue(true);
  });

  it('알려진 에러 코드 → errors.{code} 키 반환', () => {
    expect(translateErrorCode('USER_NOT_FOUND')).toBe('errors.USER_NOT_FOUND');
  });

  it('알 수 없는 코드 (exists=false) → UNKNOWN_ERROR 반환', () => {
    mocks.exists.mockReturnValue(false);
    expect(translateErrorCode('MYSTERY_CODE')).toBe('errors.UNKNOWN_ERROR');
  });

  it('metadata 전달 시 i18n.t에 전달됨', () => {
    const metadata = { field: 'email' };
    translateErrorCode('VALIDATION_ERROR', metadata);
    expect(mocks.t).toHaveBeenCalledWith('errors.VALIDATION_ERROR', metadata);
  });
});
