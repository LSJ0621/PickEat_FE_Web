/**
 * useOAuthRedirect 테스트
 * OAuth 리다이렉트 처리 및 RE_REGISTER_REQUIRED 에러 핸들링 동작 검증
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { useOAuthRedirect } from '@features/auth/hooks/useOAuthRedirect';

// ToastContext 의존성 없이 테스트하기 위해 useErrorHandler 모킹
vi.mock('@shared/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
    handleSuccess: vi.fn(),
  }),
}));

// 최소한의 Redux store (auth slice 의존성)
function createTestStore() {
  return configureStore({
    reducer: {
      auth: (state = { user: null, token: null }) => state,
    },
  });
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={createTestStore()}>
    <MemoryRouter>{children}</MemoryRouter>
  </Provider>
);

/**
 * RE_REGISTER_REQUIRED AxiosError 생성 헬퍼
 */
function createReRegisterError(email: string, message = '탈퇴한 사용자입니다. 재가입이 필요합니다.'): AxiosError {
  const config = {} as InternalAxiosRequestConfig;
  const response: AxiosResponse = {
    data: { error: 'RE_REGISTER_REQUIRED', email, message },
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config,
  };
  return new AxiosError('RE_REGISTER_REQUIRED', 'ERR_BAD_REQUEST', config, undefined, response);
}

describe('useOAuthRedirect', () => {
  it('RE_REGISTER_REQUIRED 에러 → showReRegisterModal true + pendingEmail 설정', () => {
    const { result } = renderHook(
      () => useOAuthRedirect({ contextLabel: 'kakao-test' }),
      { wrapper }
    );

    const reRegisterError = createReRegisterError('deleted@example.com');

    let handled: boolean = false;
    act(() => {
      handled = result.current.handleReRegisterError(reRegisterError);
    });

    expect(handled).toBe(true);
    expect(result.current.showReRegisterModal).toBe(true);
    expect(result.current.pendingEmail).toBe('deleted@example.com');
  });

  it('RE_REGISTER_REQUIRED가 아닌 에러 → false 반환 + 모달 미표시', () => {
    const { result } = renderHook(
      () => useOAuthRedirect({ contextLabel: 'kakao-test' }),
      { wrapper }
    );

    const config = {} as InternalAxiosRequestConfig;
    const genericError = new AxiosError(
      '서버 오류',
      'ERR_BAD_REQUEST',
      config,
      undefined,
      {
        data: { error: 'SOME_OTHER_ERROR' },
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config,
      } as AxiosResponse,
    );

    let handled: boolean = false;
    act(() => {
      handled = result.current.handleReRegisterError(genericError);
    });

    expect(handled).toBe(false);
    expect(result.current.showReRegisterModal).toBe(false);
    expect(result.current.pendingEmail).toBeNull();
  });
});
