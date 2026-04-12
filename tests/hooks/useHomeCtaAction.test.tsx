/**
 * useHomeCtaAction 테스트
 * 인증 상태에 따른 CTA 분기(navigate vs auth prompt) 검증
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@app/store/slices/authSlice';
import { useHomeCtaAction } from '@features/home/hooks/useHomeCtaAction';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
}));

function createStore(isAuthenticated: boolean) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated,
        loading: false,
        error: null,
        language: 'ko' as const,
      },
    },
  });
}

function wrapper(store: ReturnType<typeof createStore>) {
  return function W({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe('useHomeCtaAction', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('초기 상태 — showAuthPrompt false', () => {
    const { result } = renderHook(() => useHomeCtaAction(), { wrapper: wrapper(createStore(false)) });
    expect(result.current.showAuthPrompt).toBe(false);
  });

  it('인증된 상태에서 handleCtaClick → navigate("/agent")', () => {
    const { result } = renderHook(() => useHomeCtaAction(), { wrapper: wrapper(createStore(true)) });
    act(() => { result.current.handleCtaClick(); });
    expect(mockNavigate).toHaveBeenCalledWith('/agent');
    expect(result.current.showAuthPrompt).toBe(false);
  });

  it('비인증 상태에서 handleCtaClick → showAuthPrompt true, navigate 호출 없음', () => {
    const { result } = renderHook(() => useHomeCtaAction(), { wrapper: wrapper(createStore(false)) });
    act(() => { result.current.handleCtaClick(); });
    expect(result.current.showAuthPrompt).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handleAuthClose → showAuthPrompt false', () => {
    const { result } = renderHook(() => useHomeCtaAction(), { wrapper: wrapper(createStore(false)) });
    act(() => { result.current.handleCtaClick(); });
    act(() => { result.current.handleAuthClose(); });
    expect(result.current.showAuthPrompt).toBe(false);
  });

  it('handleAuthConfirm → navigate("/login") + showAuthPrompt false', () => {
    const { result } = renderHook(() => useHomeCtaAction(), { wrapper: wrapper(createStore(false)) });
    act(() => { result.current.handleCtaClick(); });
    act(() => { result.current.handleAuthConfirm(); });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(result.current.showAuthPrompt).toBe(false);
  });
});
