/**
 * useHomeRecentHistory 테스트
 * 인증 상태에 따른 최근 추천 이력 로드/isVisible 계산 검증
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@app/store/slices/authSlice';
import { useHomeRecentHistory } from '@features/home/hooks/useHomeRecentHistory';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
}));

const mockGetRecommendationHistory = vi.hoisted(() => vi.fn());
vi.mock('@features/user/api', () => ({
  userService: {
    getRecommendationHistory: mockGetRecommendationHistory,
  },
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

describe('useHomeRecentHistory', () => {
  beforeEach(() => {
    mockGetRecommendationHistory.mockReset();
  });

  it('비인증 상태 — API 호출 없음, items 빈 배열, isVisible false', async () => {
    const { result } = renderHook(() => useHomeRecentHistory(), { wrapper: wrapper(createStore(false)) });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockGetRecommendationHistory).not.toHaveBeenCalled();
    expect(result.current.items).toEqual([]);
    expect(result.current.isVisible).toBe(false);
  });

  it('인증 상태 — getRecommendationHistory({ limit: 3 }) 호출 + items 설정', async () => {
    mockGetRecommendationHistory.mockResolvedValue({ items: [{ id: 1 }, { id: 2 }] });
    const { result } = renderHook(() => useHomeRecentHistory(), { wrapper: wrapper(createStore(true)) });

    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(mockGetRecommendationHistory).toHaveBeenCalledWith({ limit: 3 });
  });

  it('로딩 중 isLoading true → 완료 후 false', async () => {
    let resolveFn: ((v: unknown) => void) | null = null;
    mockGetRecommendationHistory.mockImplementation(
      () => new Promise((resolve) => { resolveFn = resolve; }),
    );
    const { result } = renderHook(() => useHomeRecentHistory(), { wrapper: wrapper(createStore(true)) });
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    resolveFn!({ items: [] });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('API 실패 — items 빈 배열 유지, isVisible false', async () => {
    mockGetRecommendationHistory.mockRejectedValue(new Error('oops'));
    const { result } = renderHook(() => useHomeRecentHistory(), { wrapper: wrapper(createStore(true)) });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toEqual([]);
    expect(result.current.isVisible).toBe(false);
  });

  it('items 있으면 isVisible true, 비어있으면 false', async () => {
    mockGetRecommendationHistory.mockResolvedValue({ items: [{ id: 1 }] });
    const { result } = renderHook(() => useHomeRecentHistory(), { wrapper: wrapper(createStore(true)) });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.isVisible).toBe(true);
  });

  it('인증 상태 전환 — 비인증→인증으로 바뀌면 재조회', async () => {
    mockGetRecommendationHistory.mockResolvedValue({ items: [{ id: 1 }] });
    const store = configureStore({
      reducer: {
        auth: (state: ReturnType<typeof authReducer>, action: { type: string; payload?: boolean }) => {
          if (action.type === 'TEST_SET_AUTH') {
            return { ...state, isAuthenticated: action.payload ?? false };
          }
          return authReducer(state, action);
        },
      },
      preloadedState: {
        auth: { user: null, isAuthenticated: false, loading: false, error: null, language: 'ko' as const },
      },
    });

    const { result } = renderHook(() => useHomeRecentHistory(), { wrapper: wrapper(store) });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockGetRecommendationHistory).not.toHaveBeenCalled();

    store.dispatch({ type: 'TEST_SET_AUTH', payload: true });

    await waitFor(() => expect(mockGetRecommendationHistory).toHaveBeenCalledWith({ limit: 3 }));
    await waitFor(() => expect(result.current.items).toHaveLength(1));
  });
});
