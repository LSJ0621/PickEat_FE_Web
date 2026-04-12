/**
 * useErrorHandler 테스트
 * 에러 타입 분류, toast 호출, 성공 메시지 표시 검증
 */

import { renderHook } from '@testing-library/react';
import { AxiosError } from 'axios';
import { useErrorHandler, ErrorType } from '@shared/hooks/useErrorHandler';

// useToast 모킹
const mockError = vi.fn();
const mockSuccess = vi.fn();
const mockInfo = vi.fn();

vi.mock('@shared/hooks/useToast', () => ({
  useToast: () => ({
    error: mockError,
    success: mockSuccess,
    info: mockInfo,
  }),
}));

// i18next 모킹
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, interpolation?: Record<string, unknown>) => {
      if (interpolation) return `${key}:${JSON.stringify(interpolation)}`;
      return key;
    },
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
}));

describe('useErrorHandler', () => {
  beforeEach(() => {
    mockError.mockClear();
    mockSuccess.mockClear();
  });

  it('handleError — 일반 Error 객체 처리', () => {
    const { result } = renderHook(() => useErrorHandler());

    result.current.handleError(new Error('테스트 에러'), 'TestContext');

    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith('테스트 에러', 5000);
  });

  it('handleError — 400 AxiosError → validation duration(4000ms)', () => {
    const { result } = renderHook(() => useErrorHandler());

    const axiosError = new AxiosError('Bad Request', '400', undefined, undefined, {
      status: 400,
      data: { message: '잘못된 요청입니다.' },
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
    });

    result.current.handleError(axiosError, 'TestContext');

    expect(mockError).toHaveBeenCalledWith('잘못된 요청입니다.', 4000);
  });

  it('handleError — 500 AxiosError → server error duration(5000ms)', () => {
    const { result } = renderHook(() => useErrorHandler());

    const axiosError = new AxiosError('Server Error', '500', undefined, undefined, {
      status: 500,
      data: { message: '서버 오류' },
      statusText: 'Internal Server Error',
      headers: {},
      config: {} as any,
    });

    result.current.handleError(axiosError, 'TestContext');

    expect(mockError).toHaveBeenCalledWith('서버 오류', 5000);
  });

  it('handleError — 문자열 에러 처리', () => {
    const { result } = renderHook(() => useErrorHandler());

    result.current.handleError('문자열 에러 메시지', 'TestContext');

    expect(mockError).toHaveBeenCalledTimes(1);
  });

  it('handleSuccess — 번역 키로 성공 메시지 표시', () => {
    const { result } = renderHook(() => useErrorHandler());

    result.current.handleSuccess('toast.address.saved');

    expect(mockSuccess).toHaveBeenCalledWith('toast.address.saved', undefined);
  });

  it('handleSuccess — 보간 파라미터 전달', () => {
    const { result } = renderHook(() => useErrorHandler());

    result.current.handleSuccess('toast.address.deleted', { count: 3 });

    expect(mockSuccess).toHaveBeenCalledTimes(1);
    // t가 key:interpolation 형식을 반환하므로 그에 맞게 검증
    expect(mockSuccess).toHaveBeenCalledWith(
      expect.stringContaining('toast.address.deleted'),
      undefined
    );
  });

  it('handleSuccess — 커스텀 duration 전달', () => {
    const { result } = renderHook(() => useErrorHandler());

    result.current.handleSuccess('toast.saved', undefined, 3000);

    expect(mockSuccess).toHaveBeenCalledWith(expect.any(String), 3000);
  });

  it('handleError — unknown 에러(null) 처리 시 기본 메시지 사용', () => {
    const { result } = renderHook(() => useErrorHandler());

    result.current.handleError(null, 'TestContext');

    expect(mockError).toHaveBeenCalledTimes(1);
    // extractErrorMessage가 fallback 사용
    expect(mockError).toHaveBeenCalledWith(expect.any(String), 5000);
  });
});
