/**
 * usePlaceSelection 테스트
 * 가게 선택 모달, 장소 선택 API, Google 검색 가게 차단, 에러 처리 검증
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import agentReducer from '@app/store/slices/agentSlice';
import authReducer from '@app/store/slices/authSlice';
import { usePlaceSelection } from '@features/agent/hooks/usePlaceSelection';

// useErrorHandler 모킹
const mockHandleError = vi.fn();
const mockHandleSuccess = vi.fn();

vi.mock('@shared/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
    handleSuccess: mockHandleSuccess,
  }),
}));

// useToast 모킹
const mockToastInfo = vi.fn();

vi.mock('@shared/hooks/useToast', () => ({
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn(),
    info: mockToastInfo,
  }),
}));

// ratingService 모킹
const mockSelectPlace = vi.hoisted(() => vi.fn());

vi.mock('@features/rating/api', () => ({
  ratingService: {
    selectPlace: mockSelectPlace,
  },
}));

// i18next 모킹
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
}));

function createTestStore(agentState: Record<string, unknown> = {}) {
  return configureStore({
    reducer: {
      auth: authReducer,
      agent: agentReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        language: 'ko' as const,
      },
      agent: {
        menuRecommendations: [],
        menuRecommendationHistoryId: null,
        menuRecommendationPrompt: '',
        menuRecommendationRequestAddress: null,
        menuRecommendationIntro: null,
        menuRecommendationClosing: null,
        isMenuRecommendationLoading: false,
        selectedMenu: null,
        menuHistoryId: null,
        menuRequestAddress: null,
        searchAiRecommendationGroups: [],
        isSearchAiLoading: false,
        searchAiLoadingMenu: null,
        searchAiRetrying: false,
        communityAiRecommendationGroups: [],
        isCommunityAiLoading: false,
        communityAiLoadingMenu: null,
        communityAiRetrying: false,
        selectedPlace: null,
        showConfirmCard: false,
        hasMenuSelectionCompleted: false,
        ...agentState,
      },
    },
  });
}

function createWrapper(store: ReturnType<typeof createTestStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe('usePlaceSelection', () => {
  beforeEach(() => {
    mockSelectPlace.mockReset();
    mockHandleError.mockClear();
    mockHandleSuccess.mockClear();
    mockToastInfo.mockClear();
    mockSelectPlace.mockResolvedValue({ id: 1, placeId: 'test', placeName: 'Test' });
  });

  it('초기 상태 — 모달 닫힘, 장소 없음', () => {
    const store = createTestStore();
    const { result } = renderHook(() => usePlaceSelection(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.hasPlaces).toBe(false);
    expect(result.current.searchPlaces).toEqual([]);
    expect(result.current.communityPlaces).toEqual([]);
  });

  it('openModal/closeModal — 모달 상태 토글', () => {
    const store = createTestStore();
    const { result } = renderHook(() => usePlaceSelection(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.openModal();
    });
    expect(result.current.isModalOpen).toBe(true);

    act(() => {
      result.current.closeModal();
    });
    expect(result.current.isModalOpen).toBe(false);
  });

  it('hasPlaces — 추천 장소 있으면 true', () => {
    const store = createTestStore({
      searchAiRecommendationGroups: [
        {
          menuName: '김치찌개',
          recommendations: [
            { placeId: 'ChIJ1', name: '가게1', reason: '이유', menuName: '김치찌개' },
          ],
        },
      ],
    });
    const { result } = renderHook(() => usePlaceSelection(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.hasPlaces).toBe(true);
    expect(result.current.searchPlaces).toHaveLength(1);
  });

  it('handleSelectPlace — 커뮤니티 장소 선택 성공', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => usePlaceSelection(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.openModal();
    });

    await act(async () => {
      await result.current.handleSelectPlace({
        placeId: 'ChIJ1',
        name: '테스트 가게',
        reason: '이유',
        menuName: '김치찌개',
        source: 'COMMUNITY',
      });
    });

    expect(mockSelectPlace).toHaveBeenCalledWith({
      placeId: 'ChIJ1',
      placeName: '테스트 가게',
    });
    expect(mockHandleSuccess).toHaveBeenCalled();
    expect(result.current.isModalOpen).toBe(false);
  });

  it('handleSelectPlace — Google 검색 가게는 평점 등록 차단', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => usePlaceSelection(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.openModal();
    });

    await act(async () => {
      await result.current.handleSelectPlace({
        placeId: 'ChIJ1',
        name: '구글 가게',
        reason: '이유',
        menuName: '김치찌개',
        source: 'GOOGLE',
      });
    });

    expect(mockSelectPlace).not.toHaveBeenCalled();
    expect(mockToastInfo).toHaveBeenCalled();
    expect(result.current.isModalOpen).toBe(false);
  });

  it('handleSelectPlace — API 실패 시 에러 처리', async () => {
    mockSelectPlace.mockRejectedValue(new Error('네트워크 오류'));

    const store = createTestStore();
    const { result } = renderHook(() => usePlaceSelection(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handleSelectPlace({
        placeId: 'ChIJ1',
        name: '테스트 가게',
        reason: '이유',
        menuName: '김치찌개',
        source: 'COMMUNITY',
      });
    });

    expect(mockHandleError).toHaveBeenCalled();
    // 에러 시 isSelecting 해제 확인
    expect(result.current.isSelecting).toBe(false);
  });

  it('searchPlaces + communityPlaces — 그룹에서 recommendations 평탄화', () => {
    const store = createTestStore({
      searchAiRecommendationGroups: [
        {
          menuName: '김치찌개',
          recommendations: [
            { placeId: 'S1', name: '검색1', reason: '이유1', menuName: '김치찌개' },
            { placeId: 'S2', name: '검색2', reason: '이유2', menuName: '김치찌개' },
          ],
        },
      ],
      communityAiRecommendationGroups: [
        {
          menuName: '김치찌개',
          recommendations: [
            { placeId: 'C1', name: '커뮤니티1', reason: '이유', menuName: '김치찌개', rating: 4.5, reviewCount: 100 },
          ],
        },
      ],
    });
    const { result } = renderHook(() => usePlaceSelection(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.searchPlaces).toHaveLength(2);
    expect(result.current.communityPlaces).toHaveLength(1);
    expect(result.current.hasPlaces).toBe(true);
  });
});
