/**
 * useHistoryAiHistory 테스트
 * AI 추천 이력 조회/그룹핑/토글 동작 검증
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@app/store/slices/authSlice';
import { useHistoryAiHistory } from '@features/history/hooks/useHistoryAiHistory';

const mockHandleError = vi.fn();
vi.mock('@shared/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
    handleSuccess: vi.fn(),
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
}));

const mockGetByHistoryId = vi.hoisted(() => vi.fn());
vi.mock('@features/agent/api', () => ({
  menuService: {
    getPlaceRecommendationsByHistoryId: mockGetByHistoryId,
  },
}));

function createStore(isAuthenticated: boolean) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: isAuthenticated ? ({ id: 1 } as never) : null,
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

const buildHistoryItem = (hasPlaceRecommendations: boolean) =>
  ({
    id: 7,
    requestAddress: '서울',
    hasPlaceRecommendations,
  } as never);

describe('useHistoryAiHistory', () => {
  beforeEach(() => {
    mockHandleError.mockClear();
    mockGetByHistoryId.mockReset();
  });

  it('초기 상태 — showAiHistory false, aiHistoryRecommendations 빈 배열', () => {
    const { result } = renderHook(() => useHistoryAiHistory({ historyItem: buildHistoryItem(true) }), {
      wrapper: wrapper(createStore(true)),
    });
    expect(result.current.showAiHistory).toBe(false);
    expect(result.current.aiHistoryRecommendations).toEqual([]);
    expect(result.current.groupedAiHistory).toEqual([]);
  });

  it('비로그인 상태 — toggle 호출 시 에러 처리 + API 호출 안 함', async () => {
    const { result } = renderHook(() => useHistoryAiHistory({ historyItem: buildHistoryItem(true) }), {
      wrapper: wrapper(createStore(false)),
    });

    await act(async () => { await result.current.handleShowAiHistory(); });

    expect(mockHandleError).toHaveBeenCalled();
    expect(mockGetByHistoryId).not.toHaveBeenCalled();
    expect(result.current.showAiHistory).toBe(false);
  });

  it('hasPlaceRecommendations false — 조회 건너뜀', async () => {
    const { result } = renderHook(() => useHistoryAiHistory({ historyItem: buildHistoryItem(false) }), {
      wrapper: wrapper(createStore(true)),
    });

    await act(async () => { await result.current.handleShowAiHistory(); });

    expect(mockGetByHistoryId).not.toHaveBeenCalled();
    expect(mockHandleError).toHaveBeenCalled();
  });

  it('API 성공 — menuName 기준 groupedAiHistory 구성', async () => {
    mockGetByHistoryId.mockResolvedValue({
      places: [
        { placeId: 'places/a', name: 'A', reason: '', menuName: '김치찌개', source: 'SEARCH' },
        { placeId: 'places/b', name: 'B', reason: '', menuName: '김치찌개', source: 'SEARCH' },
        { placeId: 'places/c', name: 'C', reason: '', menuName: '된장찌개', source: 'SEARCH' },
      ],
    });
    const { result } = renderHook(() => useHistoryAiHistory({ historyItem: buildHistoryItem(true) }), {
      wrapper: wrapper(createStore(true)),
    });

    await act(async () => { await result.current.handleShowAiHistory(); });

    expect(result.current.showAiHistory).toBe(true);
    expect(result.current.aiHistoryRecommendations).toHaveLength(3);
    expect(result.current.groupedAiHistory).toHaveLength(2);
    expect(result.current.groupedAiHistory[0].menuName).toBe('김치찌개');
    expect(result.current.groupedAiHistory[0].recommendations).toHaveLength(2);
  });

  it('API 실패 → 에러 처리 + showAiHistory false', async () => {
    mockGetByHistoryId.mockRejectedValue(new Error('net'));
    const { result } = renderHook(() => useHistoryAiHistory({ historyItem: buildHistoryItem(true) }), {
      wrapper: wrapper(createStore(true)),
    });

    await act(async () => { await result.current.handleShowAiHistory(); });

    expect(mockHandleError).toHaveBeenCalled();
    expect(result.current.showAiHistory).toBe(false);
    expect(result.current.aiHistoryRecommendations).toEqual([]);
  });

  it('이미 열린 상태에서 toggle → 닫힘', async () => {
    mockGetByHistoryId.mockResolvedValue({
      places: [
        { placeId: 'p1', name: 'N', reason: '', menuName: 'M', source: 'SEARCH' },
      ],
    });
    const { result } = renderHook(() => useHistoryAiHistory({ historyItem: buildHistoryItem(true) }), {
      wrapper: wrapper(createStore(true)),
    });

    await act(async () => { await result.current.handleShowAiHistory(); });
    expect(result.current.showAiHistory).toBe(true);

    await act(async () => { await result.current.handleShowAiHistory(); });
    expect(result.current.showAiHistory).toBe(false);
  });
});
