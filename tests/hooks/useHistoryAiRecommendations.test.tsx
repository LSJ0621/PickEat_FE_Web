/**
 * useHistoryAiRecommendations 테스트
 * 비로그인/위치/주소 검증, recommendPlacesV2 성공/400 fallback/기타 에러, 로딩 상태 검증
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@app/store/slices/authSlice';
import { useHistoryAiRecommendations } from '@features/history/hooks/useHistoryAiRecommendations';

const mockHandleError = vi.fn();
const mockHandleSuccess = vi.fn();
vi.mock('@shared/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
    handleSuccess: mockHandleSuccess,
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
}));

const mockRecommendPlacesV2 = vi.hoisted(() => vi.fn());
const mockGetByHistoryId = vi.hoisted(() => vi.fn());
vi.mock('@features/agent/api', () => ({
  menuService: {
    recommendPlacesV2: mockRecommendPlacesV2,
    getPlaceRecommendationsByHistoryId: mockGetByHistoryId,
  },
}));

function createStore({
  isAuthenticated = true,
  latitude = 37.5 as number | null,
  longitude = 127.0 as number | null,
  address = '서울' as string | null,
}: Partial<{ isAuthenticated: boolean; latitude: number | null; longitude: number | null; address: string | null }> = {}) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: (isAuthenticated
          ? { id: 1, email: 'x@x.com', latitude, longitude, address }
          : null) as never,
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

const historyItem = {
  id: 42,
  requestAddress: '서울시 강남구',
  hasPlaceRecommendations: true,
} as never;

describe('useHistoryAiRecommendations', () => {
  beforeEach(() => {
    mockHandleError.mockClear();
    mockHandleSuccess.mockClear();
    mockRecommendPlacesV2.mockReset();
    mockGetByHistoryId.mockReset();
  });

  it('초기 상태 — aiRecommendations 빈 배열, isAiLoading false, aiLoadingMenu null', () => {
    const { result } = renderHook(() => useHistoryAiRecommendations({ historyItem }), {
      wrapper: wrapper(createStore()),
    });
    expect(result.current.aiRecommendations).toEqual([]);
    expect(result.current.isAiLoading).toBe(false);
    expect(result.current.aiLoadingMenu).toBeNull();
  });

  it('비로그인 상태에서 요청 → 에러 처리 + recommendPlacesV2 호출 안 함', async () => {
    const { result } = renderHook(() => useHistoryAiRecommendations({ historyItem }), {
      wrapper: wrapper(createStore({ isAuthenticated: false })),
    });

    await act(async () => { await result.current.handleAiRecommend('김치찌개'); });

    expect(mockHandleError).toHaveBeenCalled();
    expect(mockRecommendPlacesV2).not.toHaveBeenCalled();
  });

  it('위치 누락 → 검증 에러 처리, recommendPlacesV2 호출 안 함', async () => {
    const { result } = renderHook(() => useHistoryAiRecommendations({ historyItem }), {
      wrapper: wrapper(createStore({ latitude: null, longitude: null })),
    });

    await act(async () => { await result.current.handleAiRecommend('김치찌개'); });

    expect(mockHandleError).toHaveBeenCalled();
    expect(mockRecommendPlacesV2).not.toHaveBeenCalled();
  });

  it('recommendPlacesV2 성공 → aiRecommendations 정규화 후 반영', async () => {
    mockRecommendPlacesV2.mockResolvedValue({
      recommendations: [
        { placeId: 'places/abc', name: 'R1', reason: 'r', menuName: 'ignored' },
      ],
      searchEntryPointHtml: '<html/>',
    });
    const { result } = renderHook(() => useHistoryAiRecommendations({ historyItem }), {
      wrapper: wrapper(createStore()),
    });

    await act(async () => { await result.current.handleAiRecommend('김치찌개'); });

    expect(result.current.aiRecommendations).toHaveLength(1);
    expect(result.current.aiRecommendations[0].placeId).toBe('abc');
    expect(result.current.aiRecommendations[0].menuName).toBe('김치찌개');
    expect(result.current.searchEntryPointHtml).toBe('<html/>');
    expect(result.current.isAiLoading).toBe(false);
    expect(result.current.aiLoadingMenu).toBeNull();
  });

  it('400 에러 → getPlaceRecommendationsByHistoryId 폴백으로 저장된 추천 로드', async () => {
    const { isAxiosError } = await import('axios');
    void isAxiosError;
    const err = Object.assign(new Error('bad'), {
      isAxiosError: true,
      response: { status: 400 },
    });
    mockRecommendPlacesV2.mockRejectedValue(err);
    mockGetByHistoryId.mockResolvedValue({
      places: [
        {
          placeId: 'places/xyz',
          name: 'Saved',
          reason: 'saved',
          menuName: '김치찌개',
          source: 'SEARCH',
        },
      ],
    });

    const { result } = renderHook(() => useHistoryAiRecommendations({ historyItem }), {
      wrapper: wrapper(createStore()),
    });

    await act(async () => { await result.current.handleAiRecommend('김치찌개'); });

    expect(mockGetByHistoryId).toHaveBeenCalledWith(42);
    expect(result.current.aiRecommendations).toHaveLength(1);
    expect(result.current.aiRecommendations[0].placeId).toBe('xyz');
  });

  it('400 이외 에러 → 에러 핸들링 + aiRecommendations 유지', async () => {
    mockRecommendPlacesV2.mockRejectedValue(new Error('plain'));
    const { result } = renderHook(() => useHistoryAiRecommendations({ historyItem }), {
      wrapper: wrapper(createStore()),
    });

    await act(async () => { await result.current.handleAiRecommend('김치찌개'); });

    expect(mockHandleError).toHaveBeenCalled();
    expect(result.current.aiRecommendations).toEqual([]);
  });

  it('요청 중 aiLoadingMenu에 메뉴명 노출 → 완료 후 null', async () => {
    let resolveFn: ((v: unknown) => void) | null = null;
    mockRecommendPlacesV2.mockImplementation(
      () => new Promise((resolve) => { resolveFn = resolve; }),
    );
    const { result } = renderHook(() => useHistoryAiRecommendations({ historyItem }), {
      wrapper: wrapper(createStore()),
    });

    act(() => { void result.current.handleAiRecommend('김치찌개'); });
    await waitFor(() => expect(result.current.aiLoadingMenu).toBe('김치찌개'));
    expect(result.current.isAiLoading).toBe(true);

    await act(async () => {
      resolveFn!({ recommendations: [] });
    });
    await waitFor(() => expect(result.current.aiLoadingMenu).toBeNull());
    expect(result.current.isAiLoading).toBe(false);
  });

  it('searchEntryPointHtml — 응답의 HTML 저장', async () => {
    mockRecommendPlacesV2.mockResolvedValue({
      recommendations: [{ placeId: 'p1', name: 'N', reason: '', menuName: 'm' }],
      searchEntryPointHtml: '<div>entry</div>',
    });
    const { result } = renderHook(() => useHistoryAiRecommendations({ historyItem }), {
      wrapper: wrapper(createStore()),
    });

    await act(async () => { await result.current.handleAiRecommend('김치찌개'); });

    expect(result.current.searchEntryPointHtml).toBe('<div>entry</div>');
  });
});
